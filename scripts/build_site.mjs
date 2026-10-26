import { spawnSync } from 'node:child_process'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { load } from '@slidev/parser/fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
if (args.length && !(args.length === 2 && args[0] === '--base')) throw new Error('Usage: node scripts/build_site.mjs [--base /repository/]')
const base = (args[1] || '/').replace(/\/?$/, '/')
if (!base.startsWith('/') || base.startsWith('//') || base.includes('..') || /[?#]/.test(base)) throw new Error('Invalid base pathname')
const result = spawnSync(process.execPath, [require.resolve('@slidev/cli/bin/slidev.mjs'), 'build', 'example.md', '--out', 'dist', '--base', base], { stdio: 'inherit', windowsHide: true })
if (result.error || result.status !== 0) throw result.error || new Error('Build failed')
const index = 'dist/index.html'
const normalize = `<script>if(location.pathname.length>${base.length}&&/\\/[0-9]+\\/$/.test(location.pathname))history.replaceState(null,"",location.pathname.slice(0,-1)+location.search+location.hash)</script>`
await writeFile(index, (await readFile(index, 'utf8')).replace('<head>', `<head>\n${normalize}`))
const data = await load({ roots: [process.cwd()], userRoot: process.cwd() }, path.resolve('example.md'))
for (const route of ['overview', 'notes', 'presenter', ...data.slides.flatMap((_,i) => [String(i+1), `presenter/${i+1}`])]) {
  await mkdir(`dist/${route}`, { recursive: true })
  await cp(index, `dist/${route}/index.html`)
}
console.log(`Built ${data.slides.length} UCAS showcase routes under ${base}`)
