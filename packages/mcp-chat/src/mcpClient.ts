import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { ChatCompletionTool } from "openai/resources/chat/completions";

const client = new Client({
  name: "mcp-client-qwen",
  version: "1.0.0",
});

let tools: ChatCompletionTool[] = [];
let currentMcpServer = "";

interface McpServerConfig {
  name: string;
  url: string;
  description: string;
}

const mcpServers: McpServerConfig[] = [
  {
    name: "fetcher-mcp",
    url: "https://mcp.so/sse/fetcher-mcp",
    description: "网页内容抓取工具，支持获取网页内容并转换为Markdown"
  },
  {
    name: "browser-mcp",
    url: "https://mcp.so/sse/browser-mcp",
    description: "浏览器自动化工具，支持完整的浏览器操作和交互"
  },
  {
    name: "amap-maps",
    url: "https://mcp.so/sse/amap-maps",
    description: "高德地图MCP服务，提供路线规划、地点搜索等功能"
  },
  {
    name: "aliyun-bailian",
    url: "https://mcp.so/sse/aliyun-bailian",
    description: "阿里云百炼MCP服务，提供多种AI工具和模型调用能力"
  }
];

export async function connectMcp() {
  console.log("开始连接MCP服务器...");
  
  for (const server of mcpServers) {
    try {
      console.log(`尝试连接MCP服务器: ${server.name} (${server.url})`);
      const mcpUrl = new URL(server.url);
      const transport = new StreamableHTTPClientTransport(mcpUrl);
      
      await client.connect(transport);
      const toolsRes = await client.listTools();
      
      tools = toolsRes.tools.map((item) => ({
        type: "function",
        function: {
          name: item.name,
          description: item.description,
          parameters: item.inputSchema,
        },
      }));
      
      currentMcpServer = server.name;
      console.log(`MCP服务器连接成功: ${server.name}`);
      console.log(`获取到工具列表:`, JSON.stringify(tools, null, 2));
      return;
      
    } catch (error) {
      console.error(`连接MCP服务器失败: ${server.name}`, error);
      console.log(`错误信息:`, error.message);
      continue;
    }
  }
  
  console.error("所有MCP服务器连接失败，MCP工具将不可用");
  console.log("系统仍可正常工作，但无法调用MCP工具");
  tools = [];
  currentMcpServer = "";
}

export async function switchMcpServer(serverName: string) {
  console.log(`切换MCP服务器到: ${serverName}`);
  
  const server = mcpServers.find(s => s.name === serverName);
  if (!server) {
    console.error(`未找到MCP服务器: ${serverName}`);
    return false;
  }
  
  try {
    await client.close();
    const mcpUrl = new URL(server.url);
    const transport = new StreamableHTTPClientTransport(mcpUrl);
    await client.connect(transport);
    const toolsRes = await client.listTools();
    
    tools = toolsRes.tools.map((item) => ({
      type: "function",
      function: {
        name: item.name,
        description: item.description,
        parameters: item.inputSchema,
      },
    }));
    
    currentMcpServer = serverName;
    console.log(`MCP服务器切换成功: ${serverName}`);
    console.log(`获取到工具列表:`, JSON.stringify(tools, null, 2));
    return true;
    
  } catch (error) {
    console.error(`切换MCP服务器失败: ${serverName}`, error);
    return false;
  }
}

export function getMcpClient() {
  return client;
}

export function getTools() {
  return tools;
}

export function getCurrentMcpServer() {
  return currentMcpServer;
}

export function getAvailableMcpServers() {
  return mcpServers;
}