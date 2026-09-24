# Project Dock · 项目坞

Windows 原生项目管理工具，整理项目、文件夹、封面与部署入口。

从 [最新版本](https://github.com/Wyyyyuu/project-dock-releases/releases/latest) 下载 ProjectDock-Setup 安装包，按向导安装。支持 Windows 10/11，需要 .NET Framework 4.8 或以上。默认创建桌面快捷方式。

应用内「备份与更新」支持完整备份恢复及新版本检查、下载、安装和重启。卸载保留本机项目数据。平台 Token 不包含在可迁移备份中。

此仓库提供产品网站、安装包、签名更新清单和版本说明；桌面应用源码仍保存在私有仓库。更新清单使用 RSA-SHA256 签名，安装包尚未使用 Windows 商业代码签名证书。

## 产品网站

[访问项目坞官网](https://wyyyyuu.github.io/project-dock-releases/)

网站由 GitHub Pages 托管，`site/` 保存静态页面与公开演示素材，`scripts/build.mjs` 生成 `dist/`。只展示演示数据，不包含用户项目库、凭据或桌面应用源码。

使用 Node.js 22 或以上，在本地运行 `node scripts/build.mjs`，再通过任意静态 HTTP 服务器预览 `dist/`。本地默认使用 `site/release.json` 中的版本快照；使用 `--live` 可读取最新正式版本，支持环境变量 `GH_TOKEN`。发布查询失败会中止构建，保留此前已部署的网站。

GitHub Actions 在网站文件更新、正式 Release 发布或编辑、手动触发时重新构建并部署。下载地址、版本号和体积来自最新正式 Release；Windows 安装包必须命名为 `ProjectDock-Setup-x.y.z.exe`，并附 `SHA256SUMS.txt`。页面直接链接 GitHub Releases，访客无需访问 GitHub API。

目前只有 Windows 版，页面明确显示 macOS 尚未推出。只有正式 Release 实际提供 `ProjectDock-*.dmg` 或 `.pkg` 资产后，页面才生成 Mac 下载按钮；系统及芯片要求以相应版本说明为准。
