import express from "express";
import cors from "cors";
import { connectMcp, getMcpClient, getTools,  getCurrentMcpServer, getAvailableMcpServers } from "./mcpClient";
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
你是一位专业的股票与金融市场分析师。当用户提出与股票、指数、行业板块或金融资讯相关的问题时，请主动调用浏览器工具（优先选用东方财富网（https://quote.eastmoney.com）权威中文财经平台，使用工具获取HTML网页内容）进行实时信息检索，确保数据准确、来源可靠。

你需要基于查询结果，为用户提供以下内容：

目标股票/指数的基本信息（如代码、当前价格、涨跌幅、市值等）；
近期走势分析（包括日K线趋势、关键支撑/阻力位、成交量变化等）；
基本面或消息面简要解读（如财报亮点、重大公告、行业政策影响等）；
风险提示与投资建议（保持客观中立，不构成投资推荐）。
所有回答必须以 Markdown 格式 输出，结构清晰、重点突出，可适当使用标题、列表、加粗、表格等元素提升可读性。
若无法获取有效数据或信息不足，请如实说明，切勿臆测或编造内容。
`;

const messages: ChatCompletionMessageParam[] = [{ role: "system", content: prompt }];
// 模型回复结果
let aiMessage = "";
// 工具调用计数器
let toolCallCount = 0;

app.post("/chat", async (req, res) => {
  // userContent：用户的问题
  const { userContent } = req.body as { userContent: string | undefined };
  console.log(userContent);
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
    });
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
        const mcpRes = await getMcpClient().callTool({
          name: toolName,
          arguments: JSON.parse(toolCallArgsStr),
        });
        console.log("MCP工具调用完成，返回结果:", JSON.stringify(mcpRes));
        console.log("MCP工具返回内容:", mcpRes.content);
        // 返回前端
        const result = { type: "mcpContent", content: "mcp工具获取文章内容成功！", toolName: toolName, toolResult: JSON.stringify(mcpRes), toolCallCount: toolCallCount };
        console.log('发送MCP内容事件到前端:', JSON.stringify(result));
        notifStream(res, result);
        
        // 尝试解析股票数据
        try {
          const mcpContent = mcpRes.content as string;
          console.log('开始解析股票数据，MCP返回内容长度:', mcpContent.length);
          console.log('MCP返回内容前200字符:', mcpContent.substring(0, 200));
          if (mcpContent.includes('股价') || mcpContent.includes('价格') || mcpContent.includes('股票')) {
            console.log('检测到股票相关关键词，开始解析');
            const stockData = parseStockData(mcpContent);
            console.log('解析到股票数据数量:', stockData.length);
            if (stockData.length > 0) {
              const stockResult = { type: "stockData", content: JSON.stringify(stockData) };
              console.log('发送股票数据事件到前端:', JSON.stringify(stockResult));
              notifStream(res, stockResult);
            } else {
              console.log('未解析到股票数据');
            }
          } else {
            console.log('MCP返回内容不包含股票相关关键词');
          }
        } catch (parseError) {
          console.log('解析股票数据失败:', parseError);
        }
        // 再次调用大模型组合对话
        messages.push({ role: "user", content: mcpRes.content as string });
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

// 解析股票数据
function parseStockData(content: string) {
  const stockData: { date: string; price: number }[] = [];
  
  const pricePattern = /(\d{4}-\d{2}-\d{2})[^0-9]*([0-9]+\.?[0-9]*)/g;
  let match;
  
  while ((match = pricePattern.exec(content)) !== null) {
    if (match[1] && match[2]) {
      stockData.push({
        date: match[1],
        price: parseFloat(match[2])
      });
    }
  }
  
  return stockData;
}

// 流式输出
function notifStream(stream: Response, streamData: any) {
  stream.write(JSON.stringify({ role: "assistant", ...streamData }) + "###ABC###");
}

// 切换MCP服务器API
app.get('/api/mcp/servers', (req, res) => {
  const servers = getAvailableMcpServers();
  const currentServer = getCurrentMcpServer();
  
  res.json({
    success: true,
    currentServer,
    servers: servers.map(s => ({
      name: s.name,
      url: s.url,
      description: s.description,
      isCurrent: s.name === currentServer
    }))
  });
});


app.listen(3500, async () => {
  console.log("客户端接口启动了");
  try {
    await connectMcp();
  } catch (error) {
    console.error("mcp连接失败", error);
  }
});
