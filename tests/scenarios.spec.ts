import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

for (const [scenario, count] of [['paper', 12], ['meeting', 8], ['defense', 9]] as const) {
  test(`generated ${scenario} starter builds and its copied checker verifies every slide`, async () => {
    test.setTimeout(120000)
    const root = process.cwd()
    const destination = await mkdtemp(path.join(os.tmpdir(), `${scenario}-scenario-`))
    const run = (file: string, args: string[], cwd = root) => execFileSync(process.execPath, [file, ...args], { cwd, stdio: 'pipe', env: process.env })
    try {
      run(path.join(root, '.agents/skills/ucas-slidev/scripts/init_deck.mjs'), [destination, '--template', scenario, '--style', scenario === 'meeting' ? 'night' : scenario === 'paper' ? 'tech' : 'ime', '--theme', root])
      await mkdir(path.join(destination, 'node_modules'))
      await symlink(root, path.join(destination, 'node_modules/slidev-theme-ucas'), process.platform === 'win32' ? 'junction' : 'dir')
      for (const dependency of ['@slidev', 'playwright-chromium'])
        await symlink(path.join(root, 'node_modules', dependency), path.join(destination, 'node_modules', dependency), process.platform === 'win32' ? 'junction' : 'dir')
      run(path.join(root, 'node_modules/@slidev/cli/bin/slidev.mjs'), ['build', path.join(destination, 'slides.md'), '--out', path.join(destination, 'dist')])
      run(path.join(destination, 'scripts/check_deck.mjs'), ['slides.md', '--strict'], destination)
      const report = JSON.parse(await readFile(path.join(destination, '.slidev-check/slides/report.json'), 'utf8'))
      expect(report.totalSlides).toBe(count)
      expect(report.errors).toBe(0)
      expect(report.warnings).toBe(0)
      expect(report.pages.every((page: { screenshot: string }) => page.screenshot.endsWith('.png'))).toBe(true)
    }
    finally { await rm(destination, { recursive: true, force: true }) }
  })
}
