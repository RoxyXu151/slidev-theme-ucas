---
name: ucas-slidev
description: Create and edit University of Chinese Academy of Sciences (中国科学院大学、国科大、UCAS) Slidev presentations with slidev-theme-ucas. Use for UCAS coursework, research meetings and thesis defenses; not USTC (中国科学技术大学) or native PowerPoint editing.
---

# 国科大 Slidev 幻灯片

使用 `slidev-theme-ucas` 交付可编辑 Markdown、实际运行的网页预览，默认可编辑 PPTX，以及用户要求的 PDF 等导出物。保留已有演示内容与用户选定的风格。

## 创建与编辑

- 主题仓库中 `theme: ./`，独立演示中 `theme: ucas`。`slides.md` 是答辩起步稿，`example.md` 演示所有风格和布局。
- 新演示用本技能所在目录的脚本初始化。技能可以安装在任意目录，不把技能目录当成演示工作目录：

```bash
node "<skill-dir>/scripts/init_deck.mjs" "<project-dir>" --template paper --style minimal-blue
```

`--template paper` 为论文阅读 12 页，`meeting` 为组会 8 页，`defense` 为答辩 9 页（默认）。这些页数只是起步稿，不覆盖用户指定的实际页数。脚本拒绝非空目标目录，不联网、不安装依赖。默认依赖固定的 GitHub 主题发布包；持有主题源码时加 `--theme "<theme-repo-dir>"`。在演示目录执行 `npm install`、`npm run dev`。

## 从材料到页面

- 按用户的听众、时长和材料组织报告。未知信息用 `[待补充]`，不编造结果、文献或图片路径。
- 样式名及布局插槽见 [references/layouts.md](references/layouts.md)。简约风有蓝、红、绿三色；科技风支持顶部或侧边章节导航；校园风有斜切照片、夜景、金秋和夕阳。
- 优先按内容选图文、比较、流程、四宫格、公式或数字布局。长段落先精简或拆页，不靠缩小文字塞内容。讲稿放在每页末尾的 HTML 注释里。
- `two-cols`、`compare` 的默认插槽放总标题，正文放 `::left::`、`::right::`。图文布局的默认插槽放正文，总标题放 `::title::`。
- 同一报告通常保持一个全局 `themeConfig.style`，除非用户需要风格展示。科技导航用 `sections` 数组和从 1 开始的 `sectionIndex`；`navigation: side` 仅对 tech 生效。
- 图片放演示的 `public/`，用 `/filename.png` 引用并提供 `imageAlt`、`caption`。科研图默认 contain，不裁切证据。封面和致谢元信息来自各自页面，需要时重复填写。
- 默认 16:9、1280×720；可在 headmatter 设置 `aspectRatio: 4/3`。使用系统中文字体，不安装或分发原包商业字体。

## 检查与交付

在演示目录执行 `npm run check -- --strict`；主题仓库检查其他源稿用 `npm run check -- 文件.md --strict`。已有 Chrome 时可加 `--browser chrome`。

读取 `.slidev-check/<源稿名>/report.json` 和逐页截图，修正越界、遮挡、缺图与目录错误后重跑。完成标准是错误均已处理，提醒已修正或给出明确人工核查说明。不要删除检查、隐藏正文或缩小文字以求通过。检查器不验证研究事实、所有点击动画或 PPTX 排版。

运行 `npm run build`，人工看中文换行、图像与导航。先安装导出所需浏览器 `npx playwright install chromium`，默认用 `npm run export` 生成可编辑 `slides.pptx`；需要 PDF 时改用 `npm run export:pdf`。导出后检查实际产物中的文字、图片、字体与边界。复杂公式、渐变和裁切可能局部图片化，不能把整页图片 PPTX 当作可编辑交付。交付实际文件位置与运行方式，说明仍待作者补充的材料。报告创作不表示授权上传私人报告。

保留非官方说明及 `NOTICE.md`。原校徽、校园图片和剪影不属于代码 MIT 授权；示例汇报人不是可推定的原作者。

网页内置 `/export` 页的 PPTX 按钮仍为整页图片方式，不读取主题的 CLI 默认格式。需要可编辑 PPTX 时使用本项目的 `npm run export`。
