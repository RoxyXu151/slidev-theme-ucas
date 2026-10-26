# Project guidance

This is an unofficial UCAS Slidev theme adapted from the user-supplied template collection.

- Keep each style faithful to its supplied PPT: blue/red/green gradients and skyline, technology navigation, photographic diagonal, night, autumn and sunset designs.
- Text, tables, equations, diagrams and metrics remain editable. Do not turn full slides into bitmap backgrounds.
- Theme assets use relative module imports; support deployment subpaths. Do not fetch online fonts or images.
- Per-slide options override themeConfig, preserving false. Use only the public Slidev context API.
- Root slides.md is the editable starter; example.md covers every layout and style. Documentation has Chinese and English versions.
- Code is MIT; extracted artwork and university marks are excluded. Preserve NOTICE.md. Do not infer authorship from presenter placeholders.
- Never commit source ZIP/PPT/PDF files, fonts, credentials, node_modules, generated decks or temporary validation files.
- Maintain the portable .agents/skills/ucas-slidev skill and test its initializer outside this repository.
- Validate meaningful changes in a browser at 1280×720 and inspect PDF boundaries; check 4:3 when changing responsive geometry. Keep preview images current.
- Run npm run build, npm run build:starter, npm run test:skill, npm test, and the strict deck checker as appropriate.
- Default export is editable PPTX with npm run export; use npm run export:pdf for PDF. Verify native text and visual layout in the actual PowerPoint file; formulas and some effects may be rasterized.
- Keep demonstration data visibly labeled; do not invent research results or citations.
