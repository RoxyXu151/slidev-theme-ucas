# slidev-theme-ucas

[简体中文](README.md) · [English](README.en.md)

**中国科学院大学 Slidev 多风格学术主题**

根据用户提供的国科大 PPT 模板集合改编，将简约、科技和校园影像风格用于可编辑的网页幻灯片。适合课程展示、论文阅读、组会汇报与学位答辩。

[在线演示](https://roxyxu151.github.io/slidev-theme-ucas/1) · [主题源码](https://github.com/RoxyXu151/slidev-theme-ucas) · [使用此模板](https://github.com/new?template_owner=RoxyXu151&template_name=slidev-theme-ucas) · [AI 写作技能](.agents/skills/ucas-slidev/SKILL.md)

![八种风格](docs/preview/styles.jpg)

> 非官方社区主题。主题代码采用 MIT 许可；原校徽、校园摄影及剪影保留原有权利，不属于 MIT 授权范围。原 PPT、ZIP 和字体文件不进入仓库或安装包。详见 [NOTICE.md](NOTICE.md)。UCAS 是中国科学院大学，不是中国科学技术大学（USTC）。

## 八种风格

| `style` | 特点 | 预览 |
| --- | --- | --- |
| `minimal-blue` | 蓝色渐变与校园剪影，默认 | [第 1 页](https://roxyxu151.github.io/slidev-theme-ucas/1) |
| `minimal-red` | 红色政务风 | [第 5 页](https://roxyxu151.github.io/slidev-theme-ucas/5) |
| `minimal-green` | 绿色青春风 | [第 6 页](https://roxyxu151.github.io/slidev-theme-ucas/6) |
| `tech` | 科技蓝、几何照片与章节导航 | [第 7 页](https://roxyxu151.github.io/slidev-theme-ucas/7) |
| `diagonal` | 校园照片与深蓝几何构图 | [第 17 页](https://roxyxu151.github.io/slidev-theme-ucas/17) |
| `night` | 校园夜景、深底与橙色强调 | [第 19 页](https://roxyxu151.github.io/slidev-theme-ucas/19) |
| `autumn` | 金秋照片与棕橙配色 | [第 21 页](https://roxyxu151.github.io/slidev-theme-ucas/21) |
| `sunset` | 钟楼、秋叶与夕阳构图 | [第 23 页](https://roxyxu151.github.io/slidev-theme-ucas/23) |

风格可以放在第一页的 `themeConfig.style`，也可以单页覆盖。正文包含双栏、整块对照、图文、大图、三图、三步流程、四宫格、公式与关键数字布局。

![可编辑正文布局](docs/preview/layouts.jpg)

## 本地开始

需要 Node.js **22.18 或以上**、npm 和本地中文字体。

```bash
git clone https://github.com/RoxyXu151/slidev-theme-ucas.git
cd slidev-theme-ucas
npm ci
npm run dev
```

编辑 `example.md` 查看全部 26 页展示，或运行 `npm run dev:starter` 编辑 `slides.md` 答辩起步稿。保存 Markdown 后网页更新，`P` 查看讲稿，`O` 查看总览。

创建自己的独立报告：

```bash
npm run create:deck -- ../my-ucas-report --template defense --style tech --theme .
cd ../my-ucas-report
npm install
npm run dev
```

`paper` 为 12 页论文阅读起步稿，`meeting` 为 8 页组会起步稿，`defense` 为 9 页答辩起步稿（默认）。页数只是起点，可按实际内容调整。脚本不覆盖非空目录、不自动安装依赖。图片放在新演示的 `public/` 中。

## 已有 Slidev 项目

本主题从 GitHub 安装，不假定 npm 上的同名包属于本项目：

```bash
npm install https://github.com/RoxyXu151/slidev-theme-ucas/releases/download/v0.2.0/slidev-theme-ucas-0.2.0.tgz
```

```yaml
---
theme: ucas
lang: zh-CN
themeConfig:
  style: tech
  sections: ['研究背景', '研究方法', '实验分析', '总结展望']
  footer: 中国科学院大学 · [学院或研究所]
---
```

主题源码仓库中使用 `theme: ./`。单页配置覆盖 `themeConfig`；`footer: false` 隐藏页脚，`showPageNumber: false` 只隐藏页码。科技风可设置 `navigation: side` 使用左侧导航，用从 1 开始的 `sectionIndex` 标记当前章节。导航标签是章节位置提示，目录页使用显式页码链接跳转。

默认画布为 16:9、1280×720；第一页可设置 `aspectRatio: 4/3` 使用 4:3。学校标识保持比例，图片默认 `contain` 保留全图。原包商业字体不随项目分发，系统字体回退为微软雅黑、苹方或 Noto Sans CJK。

完整布局插槽与组件接口见 [布局参考](.agents/skills/ucas-slidev/references/layouts.md)。公式、表格、代码、`UcasMetrics`、`UcasTimeline` 和 `UcasCallout` 均保持可编辑。

## AI 写作与 skill

把 [AI_PROMPT.md](docs/AI_PROMPT.md)、真实材料和已有 Markdown 一起提供给 AI。缺少事实保留 `[待补充]`；示例数据不代表真实研究结果。

本仓库附带独立的 [ucas-slidev 技能](.agents/skills/ucas-slidev/SKILL.md)。在仓库中可以直接调用：

```text
$ucas-slidev 请根据我提供的论文制作一份国科大科技风的阅读汇报，包含讲稿并检查排版。
```

安装到个人技能目录，便于在其他项目使用：

```bash
node .agents/skills/ucas-slidev/scripts/install_skill.mjs
```

默认安装到 `~/.codex/skills/ucas-slidev`；已有目录不会被覆盖。可用 `--dest /path/to/ucas-slidev` 自定义位置。技能包含三类起步稿、初始化器和独立报告检查器，不包含源 PPT 或字体。若尚未显示，请重新打开会话。

## 检查与导出

```bash
npx playwright install chromium
npm run check -- slides.md --strict
npm run build:starter
npm run export
```

已有 Chrome 时，可加 `--browser chrome`。Linux 可运行 `npx playwright install --with-deps chromium` 并安装 Noto Sans CJK。

检查器输出 `.slidev-check/<源稿名>/index.html`、`report.json` 与逐页截图，检查越界、页眉/侧栏/页脚重叠、缺图、裁切、长标题和目录目标。根据结果修改后重跑。它不验证论文事实、所有点击动画或 PPTX 排版。

`npm run export` 默认导出 **可编辑 PPTX** 到 `slides.pptx`。需要 PDF 时使用 `npm run export:pdf`，输出 `slides.pdf`。主题同时将 Slidev 的默认导出格式设为 `pptx-editable`，显式指定格式仍可覆盖。

可编辑模式尽量保留文字、形状和图片对象。示例中的复杂公式会转成图片，表格保留为文字和形状，不是 PowerPoint 原生表格；渐变、裁切等效果也可能图片化。接收方需有对应中文字体，导出后应检查实际 PPTX。网页保留交互，Markdown 是源稿；修改后重新导出，不把 PPTX、PDF 或截图作为下一轮 Slidev 修改的源文件。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 全部风格与版式展示 |
| `npm run dev:starter` | 编辑答辩起步稿 |
| `npm run build:site -- --base /slidev-theme-ucas/` | 构建 GitHub Pages，包含可直接访问的页码路径 |
| `npm run build:starter` | 构建独立答辩网页 |
| `npm run test:skill` | 测试技能和故障检查器 |
| `npm test` | 浏览器、独立安装与起步稿回归 |
| `npm run export` | 默认导出可编辑 `slides.pptx` |
| `npm run export:pdf` | 导出 `slides.pdf` |
| `npm run export:example` | 导出完整展示的可编辑 PPTX |
| `npm run export:example:pdf` | 导出完整展示 PDF |

网页内置 `/export` 页的 PPTX 按钮仍为整页图片方式，不读取主题的 CLI 默认格式。需要可编辑 PPTX 时使用本项目的 `npm run export`。
