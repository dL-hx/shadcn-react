import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

interface ToolResponse {
  content: string | any[];
}

// 创建MCP客户端实例
const client = new Client({
  name: "mcp-bailian-client",
  version: "1.0.0",
});

// 存储工具列表
let tools: Tool[] = [];

/**
 * 连接到百炼大模型MCP服务器并获取工具列表
 */
async function connectMcp(): Promise<Tool[]> {
  try {
    // 百炼大模型MCP服务地址
    const mcpUrl = new URL("https://dashscope.aliyuncs.com/api/v1/mcp/");
    const transport = new StreamableHTTPClientTransport(mcpUrl);
    
    // 建立连接
    await client.connect(transport);
    
    // 获取工具列表
    const toolsRes = await client.listTools();
    
    // 转换工具格式为OpenAI兼容格式
    tools = toolsRes.tools.map((item: any) => ({
      type: "function",
      function: {
        name: item.name,
        description: item.description,
        parameters: item.inputSchema,
      },
    }));
    
    console.log("已连接到百炼大模型MCP服务器，获取到工具列表:");
    console.log(JSON.stringify(tools, null, 2));
    
    return tools;
  } catch (error: any) {
    console.error("连接百炼大模型MCP服务器失败:", error.message);
    throw error;
  }
}

/**
 * 获取MCP客户端实例
 * @returns {Client} MCP客户端实例
 */
function getMcpClient(): Client {
  return client;
}

/**
 * 获取已加载的工具列表
 * @returns {Tool[]} 工具列表
 */
function getTools(): Tool[] {
  return tools;
}

/**
 * 调用百炼大模型工具
 * @param {string} toolName 工具名称
 * @param {Object} args 工具参数
 */
async function callTool(toolName: string, args: any): Promise<ToolResponse> {
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    return result;
  } catch (error: any) {
    console.error(`调用工具 ${toolName} 失败:`, error.message);
    throw error;
  }
}



export { connectMcp, getMcpClient, getTools, callTool };
