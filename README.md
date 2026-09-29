# sylus-site · N109区 · 彻

秦彻（Sylus）同人资料站 —— 《恋与深空》非官方粉丝站，纯静态单页站点。

## 站点内容

- **最新活动速报** —— 当前：五星互动思念「华筵和奏」、累计签到四星「秋绘映眸」
- **酌光特调 · Shimmering Blend** —— 夜宴限定特调配方与风味标尺
- **卡面图鉴** —— 64 张思念卡面，支持时间 / 星级排序、网格与罗列视图、点击查看详情
- **角色故事 / 主线支线故事 / 生日 / 梅菲斯特 · 双影**
- **秦彻前线** —— 官方动态 + 粉丝应援记录
- **已上线卡池 + 排期预测** —— 2024—2026 卡池排期与后续预测
- **二创展示 / AI 作品专区 / DIY 周边设计 / 讨论区**

## 目录结构

```
index.html     首页（单页站点主体）
styles.css     全站样式（设计令牌 + 组件样式）
scripts.js     交互脚本（导航、卡面图鉴、弹窗、轮播、BGM、吉祥物）
images/        图片资源
music/         BGM（9 首 OST，mp3）
ai_work_*.html AI 作品专题页
banner*.html   卡池 / 混池预告页
design_concept*.html  设计稿页
.github/workflows/static.yml  GitHub Pages 自动部署
```

## 部署

推送到 `main` 分支后，`.github/workflows/static.yml` 会自动把**仓库根目录**发布到 GitHub Pages。
（首页另带有 Vercel Analytics 脚本，Vercel 侧亦可直接部署仓库根目录。）

- GitHub Pages：<https://hotpot-cx.github.io/sylus-site/>
- 一个命令同步本机改动（工作区 `_backup/qa/sync-to-github.ps1`）：

```powershell
powershell -File _backup\qa\sync-to-github.ps1 -Message "更新活动信息"
```

脚本会拉取仓库 → 复制站点文件（保留 `README.md` / `.github`）→ 提交 → 推送，并列出本次部署运行状态。
只想预览改动可加 `-DryRun`。

## 更新活动信息的 5 处位置

1. `index.html` → `#event` 最新活动速报的两张活动卡（时间 / 文案 / 奖励，区块上方有维护注释）
2. `index.html` → `#cards` 图鉴最前面的 `.card`（`data-release` / `data-story` / `data-image`）
3. `index.html` → `#frontline` 官方动态首条
4. `index.html` → `#schedule` 当年度表格新增一行，并把状态标为 `status-badge live`（进行中）
5. `index.html` 顶部 `.nav-preheat` 文案、首屏速报走马灯，以及 `scripts.js` 里的 `dialogueMap` 吉祥物台词

视图与配图：`images/event_*.jpg` 为活动主视觉，首页首屏卡扇、活动板块、全站滚动背景都会复用。

## 声明

本站为同人创作，所有角色版权归叠纸游戏（Papergames）所有，仅供交流与分享，请勿用于商业用途。
