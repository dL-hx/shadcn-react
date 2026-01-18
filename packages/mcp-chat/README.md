# MCP Chat Server

这个项目包含两个服务：
1. **主服务** (端口 3500)：处理聊天请求，连接到 OpenAI 和 MCP 服务器
2. **MCP 服务器** (端口 3001)：提供天气查询和网页爬取工具

## 安装依赖

```bash
npm install
```

**重要：安装 Playwright 浏览器**

```bash
npx playwright install chromium
```

或者只安装 Chromium：

```bash
npx playwright install --with-deps chromium
```

## 启动服务

### 方式1：顺序启动（推荐，避免 pnpm 递归调用错误）

```bash
npm run dev:sequential
```

这将：
1. 先启动 MCP 服务器（端口 3001）
2. 等待 2 秒
3. 再启动主服务（端口 3500）

### 方式2：同时启动两个服务

```bash
npm run dev
```

或者使用 pnpm：

```bash
pnpm run dev
```

这将同时启动：
- 主服务：http://localhost:3500
- MCP 服务器：http://localhost:3001

### 方式3：单独启动服务

**只启动主服务：**
```bash
npm run dev:api
```

**只启动 MCP 服务器：**
```bash
npm run dev:mcp
```

### 使用 start 命令

如果遇到 pnpm 递归调用错误，可以使用：

```bash
npm run start
```

或者直接使用 concurrently：

```bash
npx concurrently --no-fund "tsx watch ./src/index.ts" "tsx watch ./src/mcpServer.ts" --name api,mcp
```

## 可用工具

### 1. get_weather
查询指定城市的天气信息（使用高德地图 API）

**参数：**
- `address` (string, required): 地址或城市名称（中文，例如：北京、上海、西安）

**返回示例：**
```json
{
  "status": "1",
  "lives": [
    {
      "province": "陕西",
      "city": "西安市",
      "weather": "阴",
      "temperature": "2",
      "winddirection": "西南",
      "windpower": "≤3",
      "humidity": "100"
    }
  ]
}
```

### 2. fetch_webpage
爬取指定网页的内容并提取主要文本信息（使用 Playwright + 百炼大模型总结）

**参数：**
- `url` (string, required): 要爬取的网页URL（例如：https://example.com）

**返回示例：**
```json
{
  "success": true,
  "url": "https://example.com",
  "originalLength": 15000,
  "extractedLength": 8000,
  "summary": "这篇文章主要讲述了...",
  "rawText": "文章的前5000个字符..."
}
```

**错误处理：**
- 如果 Playwright 浏览器未安装，会返回友好的错误提示
- 如果网页内容为空或过短，会返回相应的错误信息

## API 端点

### 主服务 (3500端口)

**POST** `/chat`
发送聊天消息，支持流式响应

**请求体：**
```json
{
  "userContent": "用户输入的消息",
  "deepSearch": false
}
```

**响应格式：**
流式 JSON，每个消息以 `###ABC###` 分隔

**消息类型：**
- `deepThinking`: 深度思考内容
- `modelSummary`: 模型总结内容
- `toolCallStart`: 工具调用开始
- `mcpContent`: MCP 工具返回内容
- `error`: 错误信息

### MCP 服务器 (3001端口)

**POST** `/mcp`
MCP 协议端点，用于工具调用

## 调试

查看控制台日志以调试：
- MCP 服务器连接状态
- 工具调用参数
- 网页爬取过程
- AI 总结结果

## 技术栈

- **后端框架**: Express.js
- **AI 模型**: 通义千问 (qwen3-235b-a22b)
- **MCP SDK**: @modelcontextprotocol/sdk
- **网页爬取**: Playwright (chromium)
- **天气 API**: 高德地图
- **开发工具**: TypeScript, tsx, nodemon
- **并发管理**: concurrently

## 注意事项

1. **必须安装 Playwright 浏览器**：运行 `npx playwright install chromium`
2. 两个服务需要同时运行才能正常工作
3. MCP 服务器启动时会自动连接到主服务
4. 网页爬取使用无头浏览器，不会显示 GUI
5. 确保网络连接正常，因为需要访问外部 API
6. 如果遇到 Playwright 未安装错误，请运行 `npx playwright install chromium`
