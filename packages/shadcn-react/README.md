# Chat Bot Frontend

基于 React 和 Shadcn UI 的智能聊天机器人前端应用，集成了 Vercel React 最佳实践技能，提供高性能的用户体验。

## 项目特性

- 🤖 智能聊天界面
- 🎨 现代化 UI 设计（Shadcn UI）
- ⚡ 高性能（基于 Vercel React 最佳实践）
- 🔄 实时流式输出
- 🛑 可终止的搜索功能
- 📊 数据可视化（Analytics 页面）
- 📱 响应式设计

## 快速开始

### 安装依赖

```bash
# 在项目根目录运行
npm install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 在 packages/shadcn-react 目录运行
npm run dev

# 或使用 pnpm
pnpm dev
```

服务器将在 `http://localhost:5173` 启动。

## 项目结构

```
src/
├── components/         # 组件
│   ├── ui/             # Shadcn UI 组件
│   └── app-sidebar.tsx # 应用侧边栏
├── hooks/              # 自定义 Hooks
├── lib/                # 工具库
├── pages/              # 页面
│   ├── chatbot/        # 聊天机器人页面
│   ├── analytics/      # 数据分析页面
│   └── dashboard/      # 仪表盘页面
├── styles/             # 样式
├── App.tsx             # 应用入口
└── main.tsx            # 主文件
```

## 使用方法

### 1. 智能聊天

- **发送消息**：在输入框中输入问题，按 Enter 键或点击发送按钮
- **流式输出**：查看实时的 AI 回复
- **终止搜索**：在流式输出过程中，点击停止按钮终止搜索
- **查看原始数据**：点击消息下方的 "查看原始数据" 按钮查看 MCP 调用的原始 JSON 响应

### 2. 使用 React 最佳实践技能

该项目集成了 `vercel-react-best-practices` 技能，可自动应用 React 和 Next.js 性能优化指南。

#### 自动触发

当你在开发中遇到以下场景时，agent 会自动使用该技能：
- **编写新组件**：创建 React 或 Next.js 组件时
- **性能问题**：提到"性能优化"、"加载慢"等关键词时
- **代码审查**：请求代码审查时
- **重构代码**：进行代码重构时

#### 手动触发

```bash
# 在对话中明确提到
"请使用 react-best-practices 技能优化这段代码"
"根据 vercel 的 React 最佳实践，这段代码如何改进？"
"帮我检查这段 React 代码的性能问题"
```

## 核心技能

### 1. 消除请求瀑布流（CRITICAL）

- **延迟 await 直到需要时**：避免阻塞不需要的代码路径
- **基于依赖的并行化**：使用 `better-all` 最大化并行度
- **防止 API 路由中的瀑布链**：提前启动 promises，延迟 await
- **使用 Promise.all()**：并行处理独立操作
- **策略性的 Suspense 边界**：使用 Suspense 流式传输内容

### 2. 包体积优化（CRITICAL）

- **避免桶文件导入**：直接导入，避免桶文件
- **条件模块加载**：仅在功能激活时加载模块
- **延迟非关键第三方库**：在 hydration 后加载分析/日志
- **动态导入重组件**：使用 `next/dynamic` 用于重组件
- **基于用户意图预加载**：在悬停/焦点时预加载以提高感知速度

### 3. 服务端性能（HIGH）

- **验证服务端操作**：像 API 路由一样验证服务端操作
- **避免 RSC props 中的重复序列化**：最小化传递给客户端组件的数据
- **跨请求 LRU 缓存**：使用 LRU 缓存进行跨请求缓存
- **最小化 RSC 边界的序列化**：减少数据传递
- **组件组合的并行数据获取**：重组组件以并行化获取
- **使用 React.cache()**：用于每请求去重
- **使用 after()**：用于非阻塞操作

### 4. 客户端数据获取（MEDIUM-HIGH）

- **去重全局事件监听器**：避免重复的事件监听器
- **使用被动事件监听器**：为滚动使用被动监听器
- **使用 SWR**：用于自动请求去重
- **版本化和最小化 localStorage 数据**：优化本地存储

### 5. 重渲染优化（MEDIUM）

- **在渲染期间计算派生状态**：在渲染期间派生状态，而不是在 effects 中
- **将状态读取延迟到使用点**：不要订阅仅在回调中使用的状态
- **提取到记忆化组件**：将昂贵的工作提取到记忆化组件中
- **缩小 effect 依赖项**：在 effects 中使用原始依赖项
- **将交互逻辑放在事件处理程序中**：避免在 effects 中处理交互
- **订阅派生状态**：订阅派生布尔值，而不是原始值
- **使用函数式 setState 更新**：用于稳定的回调
- **使用惰性状态初始化**：为昂贵的值传递函数给 useState
- **使用 Transitions**：用于非紧急更新
- **使用 useRef**：用于临时频繁值

### 6. 渲染性能（MEDIUM）

- **动画 SVG 包装器**：动画 div 包装器，而不是 SVG 元素
- **CSS content-visibility**：用于长列表
- **提升静态 JSX 元素**：将静态 JSX 提取到组件外部
- **优化 SVG 精度**：减少 SVG 坐标精度
- **防止无闪烁的 hydration 不匹配**：为仅客户端数据使用内联脚本
- **抑制预期的不匹配**：抑制预期的 hydration 警告
- **使用 Activity 组件**：用于显示/隐藏
- **使用显式条件渲染**：使用三元运算符，而不是 && 用于条件
- **使用 useTransition**：用于加载状态

### 7. JavaScript 性能（LOW-MEDIUM）

- **避免布局抖动**：通过类或 cssText 分组 CSS 更改
- **构建索引映射**：为重复查找构建 Map
- **缓存循环中的对象属性**：减少属性访问开销
- **缓存函数结果**：在模块级 Map 中缓存函数结果
- **缓存存储 API 调用**：缓存 localStorage/sessionStorage 读取
- **组合多个数组迭代**：将多个 filter/map 组合成一个循环
- **提前长度检查**：在昂贵的比较之前检查数组长度
- **提前从函数返回**：减少函数的圈复杂度
- **提升 RegExp 创建**：在循环外部提升 RegExp 创建
- **使用循环进行 min/max**：使用循环而不是 sort 进行 min/max
- **使用 Set/Map 进行查找**：使用 Set/Map 进行 O(1) 查找
- **使用 toSorted()**：用于不可变性

### 8. 高级模式（LOW）

- **初始化应用一次**：每个应用加载初始化一次，而不是每次挂载
- **将事件处理程序存储在 refs 中**：避免不必要的重新渲染
- **使用 useEffectEvent**：用于稳定的回调 refs

## 技术栈

- **前端框架**：React 18
- **UI 库**：Shadcn UI
- **样式**：Tailwind CSS
- **路由**：React Router
- **构建工具**：Vite
- **类型系统**：TypeScript
- **状态管理**：React useState/useReducer
- **数据可视化**：Recharts

## 开发指南

### 代码规范

- 遵循 Vercel React 最佳实践
- 使用 TypeScript 类型定义
- 保持函数简洁，尽量小而可复用
- 避免重复代码
- 使用设计模式优化模块设计

### 性能优化

- 使用 `useMemo` 和 `useCallback` 优化重渲染
- 合理使用 `React.memo`
- 优化数据获取，避免请求瀑布流
- 减少不必要的重新渲染
- 优化包体积

## 部署

### 构建生产版本

```bash
# 在 packages/shadcn-react 目录运行
npm run build

# 或使用 pnpm
pnpm build
```

### 预览生产版本

```bash
# 在 packages/shadcn-react 目录运行
npm run preview

# 或使用 pnpm
pnpm preview
```

## 许可证

MIT License

## 贡献

欢迎贡献代码、报告问题或提出建议！

---

**提示**：使用 `react-best-practices` 技能可以帮助你优化代码，提升应用性能。