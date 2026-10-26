import { test, expect } from '@playwright/test'
import { inspectSlide } from '../.agents/skills/ucas-slidev/scripts/lib/checks.mjs'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, readFile, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'

test('packaged theme supports 4:3, independent installation, option overrides and subpaths', async ({ page }) => {
  test.setTimeout(120_000)
  const root = process.cwd()
  await mkdir('.work', { recursive: true })
  const fixture = await mkdtemp(path.join(root, '.work', 'package-check-'))
  const npmCli = process.env.npm_execpath
  if (!npmCli) throw new Error('Run the checks with npm test')
  const npm = (args: string[]) => execFileSync(process.execPath, [npmCli, ...args], {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' },
  })
  const packed = JSON.parse(npm(['pack', '--json', '--pack-destination', fixture]))[0]
  await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ name: 'ucas-consumer-check', private: true }))
  npm(['install', '--prefix', fixture, '--ignore-scripts', path.join(fixture, packed.filename)])
  await mkdir(path.join(fixture, 'public'))
  await copyFile('assets/ucas-seal.png', path.join(fixture, 'public', 'experiment.png'))
  await writeFile(path.join(fixture, 'slides.md'), `---
theme: ucas
title: 独立项目验证
aspectRatio: 4/3
themeConfig:
  footer: 独立项目
  primary: '#174c43'
  showPageNumber: false
  style: tech
---

# 独立安装主题

---
footer: false
---

# 隐藏页脚

---
showPageNumber: true
footer: 单页页脚
style: minimal-red
---

# 单页覆盖

<UcasCallout title="独立组件">组件随主题安装。</UcasCallout>

---
layout: image-right
image: /experiment.png
imageAlt: 本地实验图片
caption: 本地素材
---

## 实验说明

完整展示图片。

::title::

# 独立图片

---
layout: end
style: diagonal
image: /experiment.png
---

# 感谢聆听
`)
  execFileSync(process.execPath, [path.join(root, 'node_modules/@slidev/cli/bin/slidev.mjs'), 'build', path.join(fixture, 'slides.md'), '--out', 'dist', '--base', '/nested/'], {
    cwd: root, stdio: 'pipe', env: process.env,
  })
  const output = path.join(fixture, 'dist')
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url || '/', 'http://localhost').pathname
      if (!pathname.startsWith('/nested/')) { response.writeHead(404).end(); return }
      let target = path.resolve(output, `.${pathname.slice('/nested'.length)}`)
      if (!target.startsWith(`${output}${path.sep}`) && target !== output) { response.writeHead(403).end(); return }
      let body: Buffer
      try { body = await readFile(target) }
      catch { target = path.join(output, 'index.html'); body = await readFile(target) }
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp' }
      response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' }).end(body)
    }
    catch { response.writeHead(500).end() }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address() as { port: number }
  const base = `http://127.0.0.1:${address.port}/nested`
  try {
    await page.setViewportSize({ width: 1280, height: 960 })
    await page.goto(`${base}/2`)
    const second = page.locator('#slide-content .slidev-page-2')
    await expect(second).toContainText('隐藏页脚')
    await expect(second.locator('.ucas-footer')).toHaveCount(0)
    await expect(second.locator('.ucas-frame')).toHaveCSS('--ucas-primary', '#174c43')
    await expect(second.locator('.ucas-frame')).toHaveClass(/ucas-style-tech/)
    await page.goto(`${base}/3`)
    const third = page.locator('#slide-content .slidev-page-3')
    await expect(third.locator('.ucas-footer')).toContainText('单页页脚')
    await expect(third.locator('.ucas-page')).toContainText('3')
    await expect(third.locator('.ucas-callout')).toContainText('组件随主题安装')
    await expect(third.locator('.ucas-frame')).toHaveClass(/ucas-style-minimal-red/)
    for (const index of [4, 5]) {
      await page.goto(`${base}/${index}`)
      const slide = page.locator(`#slide-content .slidev-page-${index}`)
      await expect(slide.locator('h1')).toBeVisible()
      await expect.poll(() => slide.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
      await expect(slide.locator('img[src$="experiment.png"]')).toHaveAttribute('src', '/nested/experiment.png')
      const root = slide.locator('.slidev-layout')
      await page.evaluate(() => document.fonts.ready)
      expect((await root.evaluate(inspectSlide)).issues).toEqual([])
      const rect = await root.boundingBox()
      expect(rect!.width / rect!.height).toBeCloseTo(4 / 3, 2)
    }
  }
  finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
})
