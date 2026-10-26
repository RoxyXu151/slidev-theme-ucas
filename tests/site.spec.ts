import { test, expect } from '@playwright/test'
import { createServer, type Server } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

let server: Server, base: string
const output = path.resolve('dist')
test.beforeAll(async () => {
  const index = await readFile(path.join(output, 'index.html'), 'utf8')
  const assetUrl = index.match(/<script\b[^>]*\bsrc="([^"]+)"/)?.[1]
  if (!assetUrl) throw new Error('Run npm run build:site before testing the website')
  const assetPath = new URL(assetUrl, 'http://localhost').pathname
  const prefix = assetPath.slice(0, assetPath.lastIndexOf('/assets/') + 1)
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
      if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return }
      const relative = pathname.slice(prefix.length)
      let target = path.resolve(output, relative || 'index.html')
      if (target !== output && !target.startsWith(output + path.sep)) { response.writeHead(403).end(); return }
      try {
        if ((await stat(target)).isDirectory()) {
          if (!pathname.endsWith('/')) { response.writeHead(301, { Location: `${pathname}/` }).end(); return }
          target = path.join(target, 'index.html')
        }
        await stat(target)
      }
      catch {
        if (path.extname(relative)) { response.writeHead(404).end(); return }
        target = path.join(output, '404.html')
      }
      const data = await readFile(target)
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8' }
      const headers = { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' }
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/)
      if (range) {
        const start = Number(range[1]), end = Math.min(range[2] ? Number(range[2]) : data.length - 1, data.length - 1)
        response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1 }).end(data.subarray(start, end + 1))
      }
      else response.writeHead(200, { ...headers, 'Content-Length': data.length }).end(data)
    } catch { response.writeHead(500).end() }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}${prefix.replace(/\/$/, '')}`
})
test.afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())) })

test('production website serves every slide and normalizes directory URLs for TOC links', async ({ page }) => {
  const errors: string[] = [], external: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('request', r => { if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== new URL(base).origin) external.push(r.url()) })
  for (let i=1; i<=26; i++) {
    expect((await page.goto(`${base}/${i}/`))?.status()).toBe(200)
    const root=page.locator(`#slide-content .slidev-page-${i} .slidev-layout`)
    await expect(root).toBeVisible()
    await expect.poll(()=>root.locator('img').evaluateAll(imgs=>imgs.every(im=>(im as HTMLImageElement).complete&&(im as HTMLImageElement).naturalWidth>0))).toBe(true)
    await expect(page).toHaveURL(new RegExp(`/${i}$`))
  }
  await page.goto(`${base}/2/`)
  await page.locator('.ucas-toc-main').getByRole('link',{name:'科技风与正文布局',exact:true}).click()
  await expect(page).toHaveURL(/\/7$/)
  expect(errors).toEqual([]);expect(external).toEqual([])
})
