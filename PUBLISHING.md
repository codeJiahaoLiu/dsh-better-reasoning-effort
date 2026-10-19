# 发布与跨设备安装

插件包名：`dsh-better-reasoning-effort`，当前版本 `0.4.0`，运行时不需要额外依赖（React 由 Harness 宿主提供）。

## 0. 发布前检查

```sh
cd dsh-better-reasoning-effort
npm install          # 仅开发/测试需要 React
npm run build        # 重新生成 lib/client.js
npm test             # 6 个单测 + headless Chrome 集成测试
npm pack --dry-run   # 预览将发布哪些文件
```

`lib/client.js` 必须是最新的；`prepare` 会在 `npm publish` / Git 安装时自动重新构建。

## 1. 发布到 npm

注意：npm 上 `dsh-better-reasoning-effort` 这个无 scope 包名已经被占用（当前是 0.5.4，和本工程无关），不能直接 `npm publish`。发布到 npm 时改用 scope：

```json
"name": "@your-name/dsh-better-reasoning-effort"
```

同时修改 `cordis.patch.yml` 中这一行的 `name`：

```yaml
- insert:
    - id: better-reasoning-effort
      name: "@your-name/dsh-better-reasoning-effort"
```

然后：

```sh
npm login
npm publish --access public
```

如果不想使用 scope，也可以改成其它未被占用的包名，但同样要同步修改 `cordis.patch.yml` 的 `name`。

`package.json` 已经移除了 `private`，并包含 `prepare`、`files`、`dsh.bundle` 和 `dsh.client`。npm 发布前会执行 `prepare`，把最新的 `lib/` 打进包里。

> `cordis.patch.yml` 的 `name` 必须和 npm 包名完全一致，否则 profile 无法解析插件。项目目录和本地 tarball 可以继续叫 `dsh-better-reasoning-effort`；只有发布到 npm 时才需要 scope 或改名。

## 2. 另一台设备：从 npm 安装

如果已经用 scope 发布，目标设备安装这个 scoped 包名：

```sh
# 如果 dsh 已在 PATH 中
dsh plugin --profile desktop add @your-name/dsh-better-reasoning-effort

# 或使用 macOS 桌面版自带 CLI
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" \
  plugin --profile desktop add @your-name/dsh-better-reasoning-effort
```

不要安装无 scope 的 `dsh-better-reasoning-effort`：npm 上的同名包是另一个项目（0.5.4）。如果不打算发布 npm，直接使用下一节的 tarball 即可。

安装后完全退出并重新打开 DeepSeek Harness（或先刷新页面）。打开任意会话，输入框右侧会出现滑块。

## 3. 从 GitHub 安装

先把工程推到 GitHub：

```sh
git init
git add .
git commit -m "feat: reasoning effort slider"
git branch -M main
git remote add origin git@github.com:<you>/dsh-better-reasoning-effort.git
git push -u origin main
```

在目标设备安装：

```sh
dsh plugin --profile desktop add github:<you>/dsh-better-reasoning-effort
```

建议固定 tag 或 commit：

```sh
dsh plugin --profile desktop add github:<you>/dsh-better-reasoning-effort#v0.4.0
```

pnpm 默认会拦截 Git 依赖的构建脚本。如果安装提示 `prepare` 被阻止，在目标设备的 profile 配置里允许构建：

```yaml
# ~/.dsh/profiles/desktop/pnpm-workspace.yaml
allowBuilds:
  dsh-better-reasoning-effort: true
```

然后重跑安装命令。也可以直接提交已构建的 `lib/`；即使 `prepare` 被跳过，包仍能正常加载。

## 4. 从 tarball 安装（离线/内网最简单）

在本机打包：

```sh
mkdir -p dist
npm pack --pack-destination dist
# dist/dsh-better-reasoning-effort-0.4.0.tgz
```

把 tarball 通过 AirDrop、scp、U 盘等复制到另一台设备，然后：

```sh
dsh plugin --profile desktop add /path/to/dsh-better-reasoning-effort-0.4.0.tgz
```

tarball 已包含 `lib/`、`cordis.patch.yml`、README 和源码；目标设备不需要 `npm install`，也不需要重新构建。

> 运行 `npm pack --pack-destination dist` 后，tarball 会出现在当前工作区的 `dist/` 下，复制该文件即可。

## 5. 直接复制工程目录

```sh
# 从本机复制到另一台设备
scp -r dsh-better-reasoning-effort user@other-host:/path/to/
```

目标设备：

```sh
dsh plugin --profile desktop add /path/to/dsh-better-reasoning-effort
```

这种方式会在 profile 中创建 `link:` 依赖，**源目录必须保留在原路径**；移动或删除目录后插件会失效，因此只适合开发调试。

## 6. 安装后的验证与卸载

验证 profile 中已经记录依赖和 bundle：

```sh
cat ~/.dsh/profiles/desktop/package.json
```

应能看到：

```json
"dependencies": {
  "dsh-better-reasoning-effort": "link:..."   // 或版本号
},
"dsh": {
  "profile": {
    "bundles": [ "...", "dsh-better-reasoning-effort" ]
  }
}
```

重启 DeepSeek Harness，打开会话，输入框右侧应出现左侧显示 `Off/Low/High/Max`、右侧为紫色滑块的控制。卸载：

```sh
dsh plugin --profile desktop remove dsh-better-reasoning-effort
```

然后重启应用。

## 7. 注意事项

- 插件面向 DeepSeek Harness `0.2.1-rc.2` 的 Web GUI；升级 Harness 后如果菜单结构变化，可能需要更新选择器。
- 目标设备不需要安装 React；`react`/`react-dom` 只是本工程的开发依赖，运行时使用 Harness 自带的 React。
- `desktop` profile 由桌面应用管理，macOS 上请使用桌面版自带 CLI；Windows/Linux 请使用安装目录中的 `dsh` CLI（路径不同，命令参数相同）。如果目标是 `web` 或 `tui` profile，把 `--profile desktop` 换成对应 profile。
- 发布前请递增 `version`，并在干净 profile 或另一台设备上做一次真实安装验证。
- 如果使用 npm scope，务必同步更新 `cordis.patch.yml` 的 `name`。
