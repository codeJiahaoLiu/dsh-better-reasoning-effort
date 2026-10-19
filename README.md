# dsh-better-reasoning-effort

一个给 DeepSeek Harness Web GUI 用的推理强度滑块插件。它替换掉原来的推理等级下拉菜单，把控制放到输入框右侧：左边显示当前等级，右边拖动调整。

已选部分是浅紫色渐变，未选部分是灰黑色；拖动时左侧文字会实时更新。模型选择、会话记录和请求参数都不受影响。

![深色主题预览](demo/preview-dark.png)

![浅色主题预览](demo/preview-light.png)

## 功能

- 左侧显示当前等级，首字母大写：`Off`、`Low`、`High`、`Max`。
- 右侧是 220px 宽的滑块，整个控件 24px 高。
- 支持拖动、点击轨道，以及 `←` `→` `↑` `↓` `Home` `End` 键盘操作。
- 已选区域为浅紫色渐变，未选区域为灰黑色；流星只在已选区域内运动。
- 推理等级越高，扫光、流星和光晕的速度越快。
- 原生 Effort 文本和菜单入口会隐藏，模型选择列表保持原样。
- 模型没有推理等级时，自动回退到原生 UI。
- 支持浅色/深色主题、`prefers-reduced-motion` 和 `forced-colors`。

## 安装

把工程目录路径交给 `dsh plugin`：

```sh
dsh plugin --profile desktop add /path/to/dsh-better-reasoning-effort
```

如果 `dsh` 不在 `PATH` 中：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add /path/to/dsh-better-reasoning-effort
```

安装后如果页面没有立即出现滑块，刷新页面（`Cmd+R`）；仍未出现则完全退出并重新打开 DeepSeek Harness。

> profile 使用本地链接（`link:`）安装。移动或删除本工程目录后需要重新执行安装命令。

## 使用

- 拖动滑块、点击轨道，或聚焦后使用 `←` `→` `↑` `↓` `Home` `End` 调整。
- 左侧实时显示当前档位，首字母大写；右侧轨道从深到浅显示紫色渐变。
- 滑块可用时，模型按钮只显示模型名，Effort 由滑块显示；模型菜单只保留模型选择。

## 卸载

```sh
dsh plugin --profile desktop remove dsh-better-reasoning-effort
```

然后重启应用。卸载会移除注入样式和滑块 slot；不会修改模型、会话或任何用户数据。

## 工作原理

1. 向 `conversation.input.right` 列表 slot 注册 React 组件；它渲染在输入框右侧控件区、模型按钮之前。
2. 通过 slot 的 `inject(sessionId)` 获取 `ctx.modelDirectories.directoryFor(sessionId)`，订阅会话目录。
3. 从 `groups → model.reasoning.efforts` 生成档位；若适配器没有 `defaultEffort`，补一个 `Default` 档，与原生菜单一致。
4. 拖动/键盘变化调用 `directory.select({ provider, model, reasoningEffort })`，与原生选择器、`/model` 走同一条 `session.selectModel` 路径。
5. 当前档位由 `activeIndex` 驱动，拖动过程中实时更新左侧文字；`capitalizeFirst` 只把首字母大写。
6. 滑块可用时在 `<body>` 上挂 `data-rls-effort-slider`；CSS 隐藏原生 Effort 文本，并用一条 `:has(...)` 规则在菜单首帧隐藏 Effort 入口。
7. 组件 fiber dispose 时移除样式、DOM 标记、订阅和 slot 贡献。

没有宿主端逻辑、网络请求、存储或 React 内部 API 访问；不依赖哈希类名前缀。

## 动画细节

- **进度填充**：`#8b5cf6 → #e9d5ff` 的双色 oklab 连续插值，铺满当前填充宽度；不随档位改变颜色分布，低档位也不会显得不均匀。填充本身不播放位移动画，循环来自扫光、流星和光晕。
- **流星**：6 条白色拖尾位于填充层内部，从填充区左侧外进入、右侧外离开；填充层 `overflow: hidden` 把它们限制在紫色区域，灰黑未填充区不显示流星。
- **扫光**：从轨道左侧外开始，到右侧外结束；循环点不在可见区域。
- **速度随等级变化**：`--rls-pos`（0–1）驱动 CSS 时长，高档位的流星、扫光和光晕都更急促。
- **无障碍**：`prefers-reduced-motion` 下关闭所有循环动画；`forced-colors` 下使用系统色。

## 自定义

颜色、轨道尺寸和动画时长集中在 `src/plugin.css`：

```css
--rls-track-h: 22px;
--rls-thumb-size: 18px;
--rls-inset: 11px;
```

填充使用更浅的 `#8b5cf6 → #e9d5ff` oklab 渐变；轨道宽度在 `.rls-track`（默认 220px），窄容器由 `@container` 规则收窄。

## 开发与验证

运行时零依赖；`react` / `react-dom` 只作为开发依赖，用于浏览器测试与预览（实际运行使用 Harness 宿主提供的 React）。

```sh
npm install        # 安装测试/预览用的 React
npm run build      # 生成 lib/client.js（内联 CSS 的 DSH client bundle）
npm test           # Node 单测 + headless Chrome 集成测试
npm run preview    # 生成 demo/preview-{light,dark}.png
```

浏览器测试覆盖：

- slot 注册、目录注入、滑块渲染；
- 左侧只显示当前档位（`High` → `Low` → `Max` → `Default`），首字母大写；
- 没有全部档位标签行；
- 24px 控件高度、22px 轨道、静止时透明边框、长轨道（≥ 210px）和未填充灰黑区域；
- 均匀铺满填充宽度的浅紫渐变、只在填充区内的 6 条流星、圆角方形滑块；
- 原生 Effort 文本/菜单入口隐藏，模型选项保持可见；
- **菜单 Effort 入口在首帧被 CSS 隐藏**（不依赖 JS 标记，避免测量后高度变化）；
- 键盘与指针拖动提交正确的 `reasoningEffort`；
- 无推理模型回退、默认档位、卸载清理。

## 发布与跨设备安装

简短版：

```sh
# 本机打包（生成 dist/dsh-better-reasoning-effort-0.4.0.tgz）
npm pack --pack-destination dist

# 复制 tarball 到另一台设备后安装
dsh plugin --profile desktop add /path/to/dsh-better-reasoning-effort-0.4.0.tgz
```

npm 上同名包 `dsh-better-reasoning-effort` 已被占用；如果要发布到 npm，请改用 scope（例如 `@your-name/dsh-better-reasoning-effort`）并同步修改 `cordis.patch.yml` 的 `name`。GitHub 安装使用 `dsh plugin --profile desktop add github:<owner>/<repo>`。完整步骤、scope 改名、`prepare`/`allowBuilds` 和另一台设备的验证流程见 [`PUBLISHING.md`](PUBLISHING.md)。

## 兼容性说明

- 面向 DeepSeek Harness `0.2.1-rc.2` 的 Web GUI 编写。
- 档位名称来自模型适配器；`capitalizeFirst` 只影响显示，不改变实际值。
- 原生 Effort 菜单入口在滑块可用时隐藏；如果希望保留原生菜单，移除 `src/plugin.css` 顶部的两条 `data-rls-effort-slider` 隐藏规则即可。
- 原生菜单隐藏规则使用 `:has()` 定位带 `cellLabel` 的模型菜单，不会隐藏其它菜单的第二项。
- 只改变交互与视觉，不改变模型路由、请求参数或会话记录。

## 文件结构

```
dsh-better-reasoning-effort/
├── cordis.patch.yml        # bundle 层：插入 dsh-better-reasoning-effort 插件行
├── lib/
│   ├── index.js            # Host 半边（空 apply）
│   └── client.js           # 构建产物：window.__ModuleLoader__ bundle
├── src/
│   ├── plugin.js           # slot 组件、滑块交互、目录订阅、首字母大写
│   └── plugin.css          # 紫色进度、灰黑轨道、流星/流光、主题与无障碍
├── scripts/
│   ├── build.mjs           # 零依赖构建（包装 + 内联 CSS + require React）
│   └── preview.mjs         # 用 headless Chrome 生成预览图
├── test/
│   ├── unit.test.mjs       # 纯函数单测
│   ├── browser.test.mjs    # headless Chrome 测试入口
│   └── browser.html        # React 渲染与交互测试页
└── demo/
    ├── preview.html        # 可交互的滑块预览
    ├── preview-dark.png
    └── preview-light.png
```

## License

Apache-2.0
