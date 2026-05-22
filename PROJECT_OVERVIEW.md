# STA-GUI 项目全面梳理文档

## 一、项目概述

STA-GUI 是一个基于 Electron + UmiJS/Max 的桌面应用程序，主要用于静态时序分析（Static Timing Analysis）相关功能的图形界面操作。

## 二、技术栈

### 2.1 前端框架
- **UI框架**: Ant Design (antd) v5.27.0
- **前端框架**: React 18 + TypeScript
- **状态管理**: MobX + mobx-react
- **布局引擎**: flexlayout-react v0.8.17（可拖拽/可停靠的标签页布局）
- **图表库**: D3.js v7.9.0（用于波形绘制）
- **路由**: UmiJS Max v4.4.12

### 2.2 桌面框架
- **Electron**: v33
- **Electron Builder**: v24.6.3（用于打包发布）

### 2.3 构建工具
- **TypeScript**: v5.0.3
- **Cross-env**: 用于跨平台环境变量设置

### 2.4 主要依赖库
| 库名 | 版本 | 用途 |
|------|------|------|
| @ant-design/icons | 6.0.0 | 图标组件 |
| lodash | 4.17.21 | 工具函数库 |
| http-server | 14.1.1 | HTTP服务器 |

## 三、项目架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  WindowManager  │  │         IPC Handlers            │  │
│  │  - mainWindow   │  │  - socket-port                  │  │
│  │  - subWindows   │  │  - request:openSubWindow         │  │
│  └─────────────────┘  │  - showDialog                    │  │
│                       └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    contextBridge (preload.ts)
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Electron Renderer Process                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    UmiJS Application                  │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │   Layout   │  │   Pages     │  │  Components  │  │   │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │   MobX    │  │   Routes    │  │   Utils      │  │   │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    SharedWorker + WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Server                          │
│                    (WebSocket Server)                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 模块划分

| 模块 | 路径 | 职责 |
|------|------|------|
| **app/master** | app/master/ | Electron 主进程代码 |
| **src/layouts** | src/layouts/ | 页面布局组件 |
| **src/pages** | src/pages/ | 业务页面组件 |
| **src/components** | src/components/ | 公共组件 |
| **src/mobx** | src/mobx/ | 状态管理 |
| **config/routes** | config/routes/ | 路由配置 |
| **public** | public/ | 静态资源 |

## 四、通信机制

### 4.1 主进程与渲染进程通信

**IPC 通信通道**:
```typescript
// preload.ts 暴露的 API
window.myAPI          // 基础 Electron API
window.electronCommon // 通用 Electron 功能
window.electronAPI    // 请求接口（SharedWorker 封装）
```

**主要 IPC 通道**:
| 通道名 | 方向 | 用途 |
|--------|------|------|
| `socket-port` | Renderer → Main | 获取 WebSocket 端口 |
| `request:openSubWindow` | Renderer → Main | 打开子窗体 |
| `showDialog` | Renderer → Main | 打开文件选择对话框 |
| `adjustTimingWindowHeight` | Renderer → Main | 调整窗口高度 |
| `minimizeGui` | Renderer → Main | 最小化窗口 |
| `closeGui` | Renderer → Main | 关闭窗口 |

### 4.2 渲染进程与后端通信

**架构**: SharedWorker + WebSocket

```
┌─────────────┐    SharedWorker    ┌─────────────┐   WebSocket   ┌─────────────┐
│  Renderer   │ ←───────────────→ │sharedworker │ ←───────────→ │   Backend   │
│  Process    │                    │    .js      │               │   Server    │
└─────────────┘                    └─────────────┘               └─────────────┘
```

**通信流程**:
1. Renderer 进程通过 `window.electronAPI.request()` 发送请求
2. SharedWorker 接收请求，通过 WebSocket 转发到后端
3. 后端响应数据通过 WebSocket 返回
4. SharedWorker 根据响应中的 `portId` 将数据路由到对应窗口

**请求示例**:
```typescript
window.electronAPI.request({
  type: "firstPathSummary",
  isBroadcast: false,
  responseNow: false,
  ...formData
})
```

### 4.3 子窗体管理

子窗体通过 `electronCommon.openSubWindow(type, property)` 打开，每个子窗体类型对应 `windowMenuData` 中预定义的配置。

**预定义子窗体类型**: liberty, netlist, def, lef, spefsdf, sdc, application, timingPaths, eco, exit, tooltip, clockTree, objectChooser

## 五、项目目录结构

```
sta_gui/
├── app/
│   └── master/                    # Electron 主进程
│       ├── common/
│       │   └── constants.ts      # 常量定义（环境变量、菜单配置）
│       ├── utils/
│       │   └── windowManager.ts   # 窗口管理器
│       ├── main.ts               # 主进程入口
│       └── preload.ts            # 预加载脚本
│
├── config/
│   ├── routes/                   # 路由配置
│   │   ├── index.ts              # 路由汇总导出
│   │   ├── application.ts        # Application 路由
│   │   ├── def.ts                # DEF 路由
│   │   ├── eco.ts                # ECO 路由
│   │   ├── exit.ts               # Exit 路由
│   │   ├── lef.ts                # LEF 路由
│   │   ├── liberty.ts            # Liberty 路由
│   │   ├── netlist.ts            # Netlist 路由
│   │   ├── objectChooser.ts      # Object Chooser 路由
│   │   ├── sdc.ts                # SDC 路由
│   │   ├── spefsdf.ts            # SPEF/SDF 路由
│   │   ├── timingPaths.ts        # Timing Paths 路由
│   │   └── tooltip.ts            # Tooltip 路由
│   └── config.ts                 # UmiJS 配置
│
├── public/
│   └── sharedworker.js           # SharedWorker 脚本
│
├── scripts/
│   ├── dev.js                    # 开发环境脚本
│   └── libs/
│       └── port.js               # 端口工具
│
├── src/
│   ├── app.ts                    # UmiJS 入口（运行时配置）
│   ├── app.css                   # 全局样式
│   ├── app.d.ts                  # 类型声明
│   │
│   ├── components/               # 公共组件
│   │   ├── ContextMenu/          # 右键菜单
│   │   ├── FullSizeKeep/         # 尺寸保持组件
│   │   ├── GaiaClient/           # 画布渲染组件（原理图查看）
│   │   │   ├── hooks/            # 钩子函数
│   │   │   ├── utils/            # 工具函数
│   │   │   ├── index.tsx         # 主组件
│   │   │   └── interface.ts      # 类型定义
│   │   ├── GenerateReportTable/   # 报告表格组件
│   │   ├── MyFormItemContext/    # FormItem 上下文
│   │   ├── NodeTypeSelect/       # 节点类型选择器
│   │   ├── TagInput/             # 标签输入组件
│   │   ├── ThroTable/            # 吞吐量表格
│   │   └── TreeTable/            # 树形表格
│   │
│   ├── layouts/                  # 布局组件
│   │   ├── index.tsx             # 主布局
│   │   └── index.less            # 布局样式
│   │
│   ├── mobx/                     # MobX 状态管理
│   │   ├── FileStore/            # 文件状态管理
│   │   ├── FlexLayout/           # 布局状态管理
│   │   ├── Hierarchy/            # 层级结构状态
│   │   ├── SchematicZoomStore/   # 原理图缩放状态
│   │   ├── TabStore/             # 标签页状态管理
│   │   ├── Terminal/             # 终端状态
│   │   ├── TitleMenuStore/       # 标题菜单状态
│   │   ├── index.ts              # 汇总导出
│   │   └── interface.ts          # 接口定义
│   │
│   ├── pages/                    # 业务页面
│   │   ├── index.tsx             # 首页
│   │   ├── MainContent/          # 主内容区
│   │   ├── TerminalPanel/        # 终端面板
│   │   ├── TitleMenu/            # 标题菜单
│   │   └── components/           # 页面级组件
│   │       ├── Application/      # Application 页面
│   │       ├── ClockTree/       # 时钟树页面
│   │       ├── Def/             # DEF 页面
│   │       ├── Eco/             # ECO 相关页面
│   │       │   ├── FooterBtn/
│   │       │   ├── InsertBuffer/
│   │       │   ├── ObjectChooser/
│   │       │   ├── RemoveBuffer/
│   │       │   └── SizeCell/
│   │       ├── Exit/             # 退出页面
│   │       ├── FileUploadPage/   # 文件上传页面
│   │       ├── FlexLayoutWrapper/# 布局包装器
│   │       ├── GenerateReport/   # 报告生成页面
│   │       ├── Hierarchy/        # 层级页面
│   │       ├── HierarchyBrowser/ # 层级浏览器
│   │       ├── Lef/             # LEF 页面
│   │       ├── Liberty/         # Liberty 页面
│   │       ├── Netlist/         # 网表页面
│   │       ├── ObjectChooser/   # 对象选择器
│   │       ├── PathInspect/     # 路径检查页面
│   │       ├── PathSummary/     # 路径汇总页面
│   │       ├── Report/          # 报告相关
│   │       │   ├── ReportCollapse/
│   │       │   ├── ReportOptions/
│   │       │   ├── ReportOutputOpt/
│   │       │   └── TimingPaths/
│   │       ├── Schematic/        # 原理图页面
│   │       ├── Sdc/             # SDC 页面
│   │       ├── SpefSdf/         # SPEF/SDF 页面
│   │       ├── Tooltip/         # 提示信息页面
│   │       ├── TopDesign/       # 顶层设计页面
│   │       └── Waveform/        # 波形页面
│   │
│   └── utils/                    # 工具函数
│       ├── drawSquareWave.ts     # 绘制方波
│       ├── getStrDisplayWidth.ts # 获取字符串显示宽度
│       ├── openObjectChooser.ts  # 打开对象选择器
│       ├── openTooltip.ts        # 打开提示
│       └── uuid.ts               # UUID 生成
│
├── package.json                  # 项目依赖配置
├── tsconfig.json                 # TypeScript 配置
└── .npmrc                        # npm 配置
```

## 六、关键业务流程

### 6.1 应用程序启动流程

```
1. Electron Main Process 启动
   ↓
2. 判断环境 (development/production)
   ↓
3. 开发环境: 使用 webpack-dev-server
   生产环境: 启动 http-server 提供静态文件
   ↓
4. 创建主 BrowserWindow
   ↓
5. Renderer 进程加载 UmiJS 应用
   ↓
6. 初始化 SharedWorker，建立 WebSocket 连接
   ↓
7. 渲染主页面
```

### 6.2 窗口管理流程

**主窗口创建**:
- 通过 `WindowManager.createMainWindow()` 创建
- 加载 `http://localhost:${APP_WEBSERVER_PORT}/`

**子窗口创建**:
- 通过 `electronCommon.openSubWindow(type, property)` 创建
- 查找 `windowMenuData` 获取预定义配置
- 子窗口与主窗口共享同一个 WebSocket 连接

### 6.3 请求响应流程

```
1. 用户在 UI 触发操作
   ↓
2. 调用 window.electronAPI.request({ type, ...params })
   ↓
3. SharedWorker 生成 requestId，发送 WebSocket 消息
   ↓
4. Backend 处理请求
   ↓
5. Backend 通过 WebSocket 返回响应
   ↓
6. SharedWorker 根据 portId 路由到对应窗口
   ↓
7. Promise resolve，返回数据
   ↓
8. UI 更新显示
```

### 6.4 布局管理流程 (FlexLayout)

- 使用 `flexlayout-react` 库实现可拖拽标签页布局
- 主要区域: `#mainArea` (主内容区) 和 `#rightArea` (右侧区域)
- 通过 `FlexLayout` MobX Store 管理标签页状态
- 支持动态添加/删除/最大化/最小化标签页

### 6.5 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| **Path Summary** | 时序路径汇总分析 |
| **Path Inspect** | 时序路径详细检查 |
| **Schematic** | 原理图查看（GaiaClient 组件） |
| **Waveform** | 波形显示（D3.js 绘制） |
| **Liberty** | Liberty 文件解析 |
| **SDC** | 时序约束文件管理 |
| **SPEF/SDF** | 参数交换格式/标准延迟格式 |
| **DEF** | 设计交换格式 |
| **LEF** | 库交换格式 |
| **ECO** | 工程变更命令操作 |
| **Hierarchy** | 设计层级浏览 |

### 6.6 状态管理架构 (MobX)

```
┌─────────────────────────────────────────────────┐
│                 MobX Stores                      │
├─────────────────────────────────────────────────┤
│  FlexLayout     - 标签页布局状态                 │
│  TabStore       - 标签页存在性状态              │
│  Hierarchy      - 设计层级数据                  │
│  FileStore      - 文件相关状态                  │
│  Terminal       - 终端输出状态                  │
│  TitleMenuStore - 标题菜单状态                  │
│  SchematicZoomStore - 原理图缩放状态           │
└─────────────────────────────────────────────────┘
                         ↓
              React Components (Observer)
```

## 七、API 设计规范

### 7.1 请求格式

```typescript
interface RequestParam {
  type: string;           // 请求类型 (如 "firstPathSummary")
  isBroadcast?: boolean; // 是否广播
  responseNow?: boolean; // 是否立即响应
  [key: string]: any;    // 其他参数
}
```

### 7.2 响应格式

```typescript
interface Response {
  code: number;   // 状态码 (0 = 成功)
  msg: string;    // 消息
  data: any;      // 响应数据
}
```

### 7.3 预定义请求类型

| 类型 | 用途 |
|------|------|
| `firstPathSummary` | 获取路径汇总一级列表 |
| `pathDetail` | 获取路径详情 |
| `liberty` | Liberty 文件解析 |
| `sdc` | SDC 约束操作 |
| `spef` | SPEF 文件解析 |
| `sdf` | SDF 文件解析 |

## 八、路由配置

路由通过 UmiJS 的配置式路由实现，主要路由定义在 `config/routes/` 目录：

| 路径 | 组件 | 功能 |
|------|------|------|
| `/` | pages/index | 首页（主应用入口） |
| `/liberty` | Liberty | Liberty 文件管理 |
| `/netlist` | Netlist | 网表查看 |
| `/def` | Def | DEF 设计交换格式 |
| `/lef` | Lef | LEF 库交换格式 |
| `/spefsdf` | SpefSdf | SPEF/SDF 管理 |
| `/sdc` | Sdc | SDC 约束管理 |
| `/application` | Application | Application 变量 |
| `/timingPaths` | PathSummary | 时序路径 |
| `/eco` | Eco | ECO 操作 |
| `/exit` | Exit | 退出 |

## 九、构建与部署

### 9.1 脚本命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发环境 |
| `npm run build-master` | 编译 Electron 主进程代码 |
| `npm run build-umi` | 构建 UmiJS 应用 |
| `npm run build-electron` | 构建 Electron 应用 (Linux) |
| `npm run package` | 完整打包 (主进程 + UmiJS + Electron) |

### 9.2 打包产物

- 打包工具: electron-builder
- 目标平台: Linux (rpm, AppImage)
- 输出目录: `dist/`
- 应用名称: RainaStaGui

## 十、关键配置文件

### 10.1 package.json 中的 rainaConfig
```json
{
  "rainaConfig": {
    "type": "electron"
  }
}
```

### 10.2 环境变量

| 变量 | 说明 |
|------|------|
| `APP_ENV` | 运行环境 (development/production) |
| `APP_WEBSERVER_PORT` | HTTP 服务器端口 |
| `APP_SOCKET_PORT` | WebSocket 服务器端口 (默认 9999) |

### 10.3 Electron Builder 配置

- AppId: `com.raina.sta.gui`
- 可执行文件名: `RainaStaGui`
- 打包文件排除: `master/` 目录（仅在 files 中包含编译后的 main.js）
