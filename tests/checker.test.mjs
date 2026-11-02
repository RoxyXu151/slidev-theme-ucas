import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { checkDeck } from '../.agents/skills/ucas-slidev/scripts/check_deck.mjs'
import { tocFindings, reportHtml } from '../.agents/skills/ucas-slidev/scripts/lib/checks.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
test('checker distinguishes invalid invocation from an actual clean check', () => {
  const result = spawnSync(process.execPath, [path.join(root, '.agents/skills/ucas-slidev/scripts/check_deck.mjs'), '--unknown'], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  assert.match(result.stderr, /检查未完成/)
})
test('TOC validation separates nonexistent pages from title mismatches and accepts subpaths', () => {
  const pages = [
    { slide: 1, title: '目录', toc: [{ label: '研究方法', href: '/repo/3' }, { label: '不存在', href: '/repo/99' }, { label: '研究问题', href: '/repo/2' }] },
    { slide: 2, title: '研究问题', section: '' },
    { slide: 3, title: '实验结果', section: '实验' },
  ]
  const issues = tocFindings(pages, 'http://localhost:3000/repo/')
  assert.deepEqual(issues.map(i => i.code), ['TOC_LABEL_MISMATCH', 'TOC_OUT_OF_RANGE'])
  const html = reportHtml({ entry: '/reports/<script>not executable', totalSlides: 0, pages: [], issues: [], errors: 0, warnings: 0 })
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>'))
})

test('an invalid TOC URL is reported without skipping subsequent links', () => {
  const issues = tocFindings([
    { slide: 1, title: '目录', toc: [{ label: '无效地址', href: 'http://[' }, { label: '不存在', href: '99' }, { label: '研究方法', href: '2' }] },
    { slide: 2, title: '研究方法', section: '' },
  ], 'http://localhost:3000/')
  assert.deepEqual(issues.map(issue => issue.code), ['TOC_INVALID_URL', 'TOC_OUT_OF_RANGE'])
  assert.equal(issues[0].severity, 'error')
})

test('TOC checking tolerates a target whose render failed before its section was read', () => {
  const issues = tocFindings([
    { slide: 1, title: '目录', toc: [{ label: '研究方法', href: '2' }] },
    { slide: 2 },
  ], 'http://localhost:3000/')
  assert.deepEqual(issues.map(issue => issue.code), ['TOC_LABEL_MISMATCH'])
})

test('real user-deck check detects rendering faults and leaves source untouched', { timeout: 120000 }, async () => {
  await mkdir(path.join(root, '.work'), { recursive: true })
  const cwd = await mkdtemp(path.join(root, '.work', 'checker test '))
  const entry = path.join(cwd, 'slides.md')
  const source = `---
theme: ${JSON.stringify(root.replaceAll('\\', '/'))}
title: 检查器真实故障样例
---

# 检查器样例

---
layout: toc
---

1. [研究方法](3)
2. [不存在的页](99)

<a href="http://[">无效地址</a>

---
section: 实验
---

# 实验结果

<p style="position:absolute;top:560px">这段正文进入了页脚区域。</p>

---
layout: figure
image: /missing-figure.png
---

# 缺失图片

---
---

# 这是第一行<br>这是第二行<br>这是第三行

---
---

# 内容相交

<p style="position:absolute;top:140px">第一个内容块</p>
<p style="position:absolute;top:145px">第二个内容块</p>
<p style="position:absolute;top:250px;height:20px;overflow:hidden">第一行<br>第二行</p>

---
---

# 父容器裁切

<div style="height:24px;overflow:hidden"><p style="margin:0">第一行<br>第二行<br>第三行</p></div>
<div style="width:100px;overflow:hidden"><p style="width:400px;white-space:nowrap">横向裁切的正文也应被检查</p></div>

---
---

# 无段落包装的正文

<div style="position:absolute;left:1300px;top:120px">直接放在 div 中的越界文字</div>
<span style="position:absolute;left:1300px;top:180px">直接放在 span 中的越界文字</span>
`
  await writeFile(entry, source)
  const { report, out } = await checkDeck({ entry, browser: process.env.PLAYWRIGHT_CHANNEL })
  assert.equal(report.totalSlides, 8)
  const codes = new Set(report.issues.map(i => i.code))
  for (const code of ['FOOTER_OVERLAP', 'IMAGE_MISSING', 'TITLE_TOO_LONG', 'CONTENT_OVERLAP', 'CLIPPED_CONTENT', 'TOC_OUT_OF_RANGE', 'TOC_LABEL_MISMATCH', 'TOC_INVALID_URL'])
    assert.ok(codes.has(code), `${code} not detected: ${JSON.stringify(report.issues)}`)
  assert.ok(report.errors > 0)
  assert.ok(report.warnings > 0)
  assert.ok(!codes.has('RUNTIME_ERROR'), 'Browser permission failures must not masquerade as content faults')
  assert.equal(await readFile(entry, 'utf8'), source)
  assert.equal(report.issues.filter(issue => issue.slide === 7 && issue.code === 'CLIPPED_CONTENT').length, 2)
  assert.equal(report.issues.filter(issue => issue.slide === 8 && issue.code === 'CANVAS_OVERFLOW').length, 2)
  assert.equal(JSON.parse(await readFile(path.join(out, 'report.json'), 'utf8')).totalSlides, 8)
  assert.ok((await readFile(path.join(out, 'slide-04.png'))).length > 1000)
})
