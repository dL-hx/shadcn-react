import { connectMcp, callTool } from "./mcpClient";

async function testWeatherTool() {
  try {
    console.log("开始测试高德地图天气工具...");
    
    // 连接到 MCP 服务器
    await connectMcp();
    
    console.log("\n测试 1: 获取北京天气...");
    const weatherResult = await callTool("get_weather", {
      address: "北京"
    });
    
    console.log("天气查询结果:");
    console.log(JSON.stringify(weatherResult, null, 2));
    
    console.log("\n测试 2: 获取上海天气...");
    const shanghaiResult = await callTool("get_weather", {
      address: "上海"
    });
    
    console.log("上海天气查询结果:");
    console.log(JSON.stringify(shanghaiResult, null, 2));
    
    console.log("\n测试 3: 获取西安天气...");
    const xianResult = await callTool("get_weather", {
      address: "西安"
    });
    
    console.log("西安天气查询结果:");
    console.log(JSON.stringify(xianResult, null, 2));
    
    console.log("\n✅ 所有天气查询测试成功！");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

testWeatherTool();
