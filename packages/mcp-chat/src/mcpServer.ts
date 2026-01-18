import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { weatherService } from "./services/weatherService.js";
import { webpageService } from "./services/webpageService.js";

const app = express();
app.use(express.json());

const server = new Server(
  {
    name: "free-weather-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "获取指定城市的天气信息（使用高德地图 API）",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "地址或城市名称（中文，例如：北京、上海、西安）",
            },
          },
          required: ["address"],
        },
      },
      {
        name: "fetch_webpage",
        description: "爬取指定网页的内容并提取主要文本信息",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "要爬取的网页URL（例如：https://example.com）",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.log('MCP服务器收到工具调用请求:');
  console.log('  工具名称:', name);
  console.log('  原始参数:', JSON.stringify(args, null, 2));

  if (name === "get_weather") {
    const address = args?.address as string;
    console.log('  解析到的地址:', address);
    const weatherData = await weatherService.queryWeather(address);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }

  if (name === "fetch_webpage") {
    const url = args?.url as string;
    console.log('  解析到的URL:', url);
    const webpageData = await webpageService.fetchWebpage(url);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(webpageData, null, 2),
        },
      ],
    };
  }

  console.log('  返回未知工具错误:', name);
  return {
    content: [
      {
        type: "text",
        text: `未知工具: ${name}`,
      },
    ],
    isError: true,
  };
});

const transport = new StreamableHTTPServerTransport();

server.connect(transport);

app.all("/mcp", async (req, res) => {
  console.log(`收到 ${req.method} 请求:`, req.path);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3001, () => {
  console.log("MCP 服务器运行在 http://localhost:3001");
  console.log("MCP 端点: http://localhost:3001/mcp");
  console.log("可用工具:");
  console.log("  - get_weather: 天气查询（使用高德地图 API）");
  console.log("  - fetch_webpage: 网页内容爬取（使用百炼大模型总结）");
});
