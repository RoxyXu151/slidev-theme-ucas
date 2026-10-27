# 国科大 Slidev 写作提示词

将真实材料、已有 slides.md 与以下任务一起交给 AI：

请使用 slidev-theme-ucas 制作中文 Slidev 演示。用途：[填写]；听众：[填写]；时长：[填写]；总页数：[填写，含封面与致谢]；主题风格：[minimal-blue / minimal-red / minimal-green / tech / diagonal / night / autumn / sunset / ime（微电子所）]。

优先复用已有稿件，或选择 paper、meeting、defense 起步稿。主题源码仓库使用 theme: ./，独立演示使用 theme: ucas。布局接口见 `.agents/skills/ucas-slidev/references/layouts.md`。按内容选择图文、对照、三步、四宫格、公式与数字等构图，不为每页临时生成 CSS。

- 同一演示保持统一风格。科技导航使用 sections 与 sectionIndex；需要时设置 navigation: side。
- 每页一个主题，长内容先精简或拆页，不用缩小字体塞内容。
- 保留公式、表格、代码和数据的编辑能力，给借用图片和数字标注来源。
- 缺失事实用 [待补充]，不要编造结果、文献、图片路径或日期。
- 目录使用实际页码，增删页面后同步检查。讲稿放各页末尾的 HTML 注释中。
- 运行 npm run check -- --strict，查看报告 JSON 和截图，修正后重跑；再构建并人工查看。检查器不能核对研究事实或 PPTX 格式。
- 默认交付可编辑 PPTX：运行 npm run export 得到 slides.pptx；用户要求 PDF 时运行 npm run export:pdf。保留 slides.md 和实际预览。检查 PPTX 的真实可编辑对象与布局，复杂公式或效果可能图片化。没有授权时不上传私人报告。
