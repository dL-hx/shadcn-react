import express from "express";
import cors from "cors";
import { connectMcp, getMcpClient, getTools } from "./mcpClient";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAI } from "openai";
import { Response } from "express";

interface ExtendedDelta extends OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta {
  reasoning_content?: string;
}
interface QwenChatCompletion extends OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming {
  enable_thinking?: boolean;
}


const openai = new OpenAI({
  apiKey: "sk-db017ac6b884466e893d04d20a0e71fa",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});


const app = express();
app.use(cors());
app.use(express.json());

const prompt = `
你是一个智能助手，可以帮助用户查询天气信息和获取网页内容。

可用的工具：
1. get_weather: 查询指定城市的天气信息
2. fetch_webpage: 爬取指定网页的内容并提取主要文本信息

当用户询问天气时，使用 get_weather 工具。
当用户提供网页链接或要求获取网页内容时，使用 fetch_webpage 工具。

请优先调用工具获取结构化的数据，并对结果做简明解释。
`;

const messages: ChatCompletionMessageParam[] = [{ role: "system", content: prompt }];
// 模型回复结果
let aiMessage = "";
// 工具调用计数器
let toolCallCount = 0;

app.post("/chat", async (req, res) => {
  const { userContent, deepSearch } = req.body as { userContent: string | undefined; deepSearch?: boolean };
  console.log(userContent, deepSearch);
  if (!userContent) {
    res.status(400).send("缺少userContent字段");
    throw new Error("缺少userContent字段");
  }
  messages.push({ role: "user", content: userContent });
  toolCallCount = 0;
  try {
    const completion = await openai.chat.completions.create({
      model: "qwen3-235b-a22b",
      messages,
      stream: true,
      tools: getTools(),
      enable_thinking: deepSearch || false,
    } as QwenChatCompletion);
    // 存放工具的参数的
    let toolCallArgsStr = "";
    // 工具名称
    let toolName = "";
    for await (const chunk of completion) {
      // console.log("模型输出-------" + JSON.stringify(chunk));
      const chunkObj = chunk.choices;
      const delta = chunk.choices[0].delta as ExtendedDelta;
      // 深度思考
      if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
        console.log("深度思考-------");
        console.log(JSON.stringify(chunk));
        // 返回前端
        const result = { type: "deepThinking", content: delta.reasoning_content };
        notifStream(res, result);
      }
      // 最后输出总结
      if (delta.content !== undefined && delta.content) {
        console.log("最后输出总结-------");
        console.log(JSON.stringify(chunk));
        // 返回前端
        const result = { type: "modelSummary", content: delta.content };
        notifStream(res, result);
        aiMessage += delta.content;
      }
      // 触发工具调用
      if (delta.tool_calls && delta.tool_calls.length > 0 && delta.tool_calls[0]?.function?.arguments) {
        console.log("触发工具调用-------");
        console.log(JSON.stringify(chunk));
        toolCallArgsStr += delta.tool_calls[0].function?.arguments;
      }
      // 获取工具名称
      if (delta.tool_calls && delta.tool_calls.length > 0 && delta.tool_calls[0]?.function?.name) {
        toolName = delta.tool_calls[0].function?.name;
        console.log('发送工具调用开始事件，工具名:', toolName);
        const result = { type: "toolCallStart", content: toolName };
        notifStream(res, result);
      }
      // 判断工具输出结束
      if (chunkObj[0]?.finish_reason === "tool_calls") {
        console.log("工具输出结束-------");
        toolCallCount++;
        // 调用mcp获取网页内容
        console.log('准备调用MCP工具，工具名:', toolName, '参数:', toolCallArgsStr);
        
        let parsedArgs;
        try {
          parsedArgs = JSON.parse(toolCallArgsStr);
          console.log('参数解析成功:', JSON.stringify(parsedArgs, null, 2));
        } catch (parseError) {
          console.error('参数解析失败:', parseError, '原始参数:', toolCallArgsStr);
          parsedArgs = {};
        }
        
        const mcpRes = await getMcpClient().callTool({
          name: toolName,
          arguments: parsedArgs,
        });
        console.log("MCP工具调用完成，返回结果:", JSON.stringify(mcpRes));
        console.log("MCP工具返回内容:", mcpRes.content);
        
        let mcpContentText = "";
        if (Array.isArray(mcpRes.content) && mcpRes.content.length > 0) {
          mcpContentText = mcpRes.content[0].text;
          console.log("提取的 mcpContentText:", mcpContentText.substring(0, 200));
        } else {
          console.error("MCP返回内容格式不正确:", mcpRes.content);
        }
        
        let resultMessage = "MCP工具调用成功！";
        
       
        // 返回前端
        const result = { type: "mcpContent", content: resultMessage, toolName: toolName, toolResult: mcpContentText, toolResultRaw: mcpContentText, toolCallCount: toolCallCount };
        console.log('发送MCP内容事件到前端:', JSON.stringify(result));
        notifStream(res, result);
        // 再次调用大模型组合对话
        messages.push({ role: "user", content: mcpContentText });
        const completionb = await openai.chat.completions.create({
          model: "qwen3-235b-a22b",
          messages,
          stream: true,
          enable_thinking: false,
        } as QwenChatCompletion);
        for await (const chunkb of completionb) {
          console.log("mcp回复最后内容");
          console.log(JSON.stringify(chunkb));
          // 返回前端
          const result = { type: "modelSummary", content: chunkb.choices[0].delta.content };
          notifStream(res, result);
          aiMessage += chunkb.choices[0].delta.content;
        }
      }
    }
  } catch (error) {
    console.log("调用模型出错", error);
    const errorResult = { type: "error", content: "抱歉，调用模型时出现错误，请稍后重试。" };
    notifStream(res, errorResult);
  } finally {
    console.log("模型回复完毕");
    res.end();
    if (aiMessage) {
      messages.push({ role: "assistant", content: aiMessage });
    }
  }
});

// 流式输出
function notifStream(stream: Response, streamData: any) {
  stream.write(JSON.stringify({ role: "assistant", ...streamData }) + "###ABC###");
}




app.listen(3500, async () => {
  console.log("客户端接口启动了");
  try {
    await connectMcp();
  } catch (error) {
    console.error("mcp连接失败", error);
  }
});
