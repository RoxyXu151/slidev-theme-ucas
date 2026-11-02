import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { load } from '@slidev/parser/fs'
import { validateBrief } from '../.agents/skills/ucas-slidev/scripts/check_brief.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skill = path.join(root, '.agents', 'skills', 'ucas-slidev')
const init = path.join(skill, 'scripts', 'init_deck.mjs')
const install = path.join(skill, 'scripts', 'install_skill.mjs')
await mkdir(path.join(root, '.work'), { recursive: true })

function run(script, args, cwd) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' })
}
async function sandbox() { return mkdtemp(path.join(root, '.work', 'skill check ')) }

test('initializer creates a usable manifest and editable starter from another working directory', async () => {
  const cwd = await sandbox()
  const destination = path.join(cwd, '论文答辩 with spaces')
  const result = run(init, [destination], cwd)
  assert.equal(result.status, 0, result.stderr)
  const manifest = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8'))
  assert.equal(manifest.private, true)
  assert.equal(manifest.scripts.build, 'slidev build slides.md')
  assert.equal(manifest.scripts.export, 'slidev export slides.md --format pptx-editable --output slides.pptx')
  assert.equal(manifest.scripts['export:pdf'], 'slidev export slides.md --format pdf --output slides.pdf')
  assert.equal(manifest.scripts['brief:check'], 'node scripts/check_brief.mjs brief.md slides.md')
  assert.match(await readFile(path.join(destination, '.gitignore'), 'utf8'), /\*\.pptx/)
  assert.match(manifest.dependencies['slidev-theme-ucas'], /^https:\/\/github\.com\/RoxyXu151\/slidev-theme-ucas\/releases\/download\//)
  assert.equal(existsSync(path.join(destination, 'node_modules')), false, 'Scaffolding must not install dependencies')
  assert.equal(existsSync(path.join(destination, 'public')), true)
  assert.equal(existsSync(path.join(destination, 'brief.md')), true)
  assert.equal(existsSync(path.join(destination, 'scripts/check_brief.mjs')), true)
  assert.match(await readFile(path.join(destination, 'slides.md'), 'utf8'), /theme: ucas/)
  assert.match(await readFile(path.join(destination, 'THIRD_PARTY_NOTICES.md'), 'utf8'), /中国科学院大学/)
})

test('initializer preserves all existing destination contents', async () => {
  const cwd = await sandbox()
  const existing = path.join(cwd, 'existing')
  await mkdir(existing)
  await writeFile(path.join(existing, 'slides.md'), 'A report that must remain untouched')
  const result = run(init, [existing], cwd)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Refusing to overwrite/)
  assert.equal(await readFile(path.join(existing, 'slides.md'), 'utf8'), 'A report that must remain untouched')
  assert.deepEqual(await readdir(existing), ['slides.md'])
})

test('IME reports use institute branding and retain a portable title-band checker', async () => {
  const cwd=await sandbox(), destination=path.join(cwd,'ime report')
  const result=run(init,[destination,'--template','meeting','--style','ime'],cwd)
  assert.equal(result.status,0,result.stderr)
  const source=await readFile(path.join(destination,'slides.md'),'utf8')
  assert.match(source,/style: ime/)
  assert.match(source,/中国科学院微电子研究所/)
  assert.match(source,/footer: 中国科学院微电子研究所\r?\n/)
  assert.ok(!source.includes('中国科学院大学'))
  assert.match(await readFile(path.join(destination,'scripts/lib/checks.mjs'),'utf8'),/HEADER_TITLE_OVERFLOW/)
})

test('each scenario includes its own content flow, notes and portable checker', async () => {
  const cwd = await sandbox()
  for (const [name, marker] of [['paper', '论文阅读'], ['meeting', '组会汇报'], ['defense', '论文答辩']]) {
    const destination = path.join(cwd, name)
    const result = run(init, [destination, '--template', name, '--theme', root], cwd)
    assert.equal(result.status, 0, result.stderr)
    const source = await readFile(path.join(destination, 'slides.md'), 'utf8')
    assert.ok(source.includes(marker))
    assert.match(source, /<!--/)
    const manifest = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8'))
    assert.equal(manifest.scripts.check, 'node scripts/check_deck.mjs')
    assert.equal(manifest.scripts['brief:check'], 'node scripts/check_brief.mjs brief.md slides.md')
    assert.ok(manifest.devDependencies['@slidev/parser'])
    assert.equal(existsSync(path.join(destination, 'scripts/lib/checks.mjs')), true)
    assert.equal(existsSync(path.join(destination, 'scripts/verify_pptx.mjs')), true)
    assert.equal(existsSync(path.join(destination, 'scripts/check_brief.mjs')), true)
    assert.ok(manifest.devDependencies.jszip)
    assert.equal(manifest.scripts['verify:pptx'], 'node scripts/verify_pptx.mjs slides.pptx --source slides.md --require-text')
    assert.match(await readFile(path.join(destination, 'AGENTS.md'), 'utf8'), /report\.json/)
    const brief = await readFile(path.join(destination, 'brief.md'), 'utf8')
    assert.match(brief, new RegExp(`叙事模式：${name === 'paper' ? 'paper-review' : name === 'meeting' ? 'progress-review' : 'thesis-defense'}`))
    assert.equal((brief.match(/^\| \d+ \|/gm) || []).length, name === 'paper' ? 12 : name === 'meeting' ? 8 : 9)
  }
  const invalid = path.join(cwd, 'invalid scenario')
  assert.notEqual(run(init, [invalid, '--template', 'unknown'], cwd).status, 0)
  assert.equal(existsSync(invalid), false)
})

test('brief validation keeps the communication contract, narrative and page plan aligned', async () => {
  const cwd = await sandbox()
  const destination = path.join(cwd, 'brief validation')
  const created = run(init, [destination, '--template', 'paper', '--style', 'tech', '--theme', root], cwd)
  assert.equal(created.status, 0, created.stderr)
  const incomplete = await readFile(path.join(destination, 'brief.md'), 'utf8')
  assert.equal(validateBrief(incomplete, { slidesCount: 12 }).ok, false)
  const completed = incomplete.replace(/\[待补充[^\]]*\]/g, '已核对材料')
  const result = validateBrief(completed, { slidesCount: 12, deckStyle: 'tech' })
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.equal(result.values.pages.length, 12)
  assert.equal(result.values['叙事模式'], 'paper-review')
  assert.equal(result.values['导航'], 'top')
  const mismatch = validateBrief(completed, { slidesCount: 11 })
  assert.equal(mismatch.ok, false)
  assert.match(mismatch.errors.join('\n'), /slides\.md 有 11 页/)
  const unknownMode = validateBrief(completed.replace('叙事模式：paper-review', '叙事模式：unknown'), { slidesCount: 12 })
  assert.match(unknownMode.errors.join('\n'), /未知叙事模式/)
  const styleMismatch = validateBrief(completed.replace('视觉风格：tech', '视觉风格：night'), { slidesCount: 12, deckStyle: 'tech' })
  assert.match(styleMismatch.errors.join('\n'), /slides\.md 使用 tech/)
  await writeFile(path.join(destination, 'brief.md'), completed)
  await symlink(path.join(root, 'node_modules'), path.join(destination, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
  const checked = run(path.join(destination, 'scripts/check_brief.mjs'), ['brief.md', 'slides.md'], destination)
  assert.equal(checked.status, 0, checked.stderr)
  assert.match(checked.stdout, /简报检查通过：12 页/)
})

test('every tech starter highlights the chapter matching each content slide', async () => {
  const cwd = await sandbox()
  for (const scenario of ['paper', 'meeting', 'defense']) {
    const destination = path.join(cwd, scenario)
    const result = run(init, [destination, '--template', scenario, '--style', 'tech'], cwd)
    assert.equal(result.status, 0, result.stderr)
    const data = await load({ roots: [destination], userRoot: destination }, path.join(destination, 'slides.md'))
    const sections = data.slides[0].frontmatter.themeConfig.sections
    const content = data.slides.filter(slide => slide.frontmatter.section)
    assert.ok(sections.length >= 3)
    for (const slide of content)
      assert.equal(sections[slide.frontmatter.sectionIndex - 1], slide.frontmatter.section)
    assert.deepEqual([...new Set(content.map(slide => slide.frontmatter.section))], sections)
  }
})

test('installer uses CODEX_HOME and lets an explicit destination override it', async () => {
  const cwd = await sandbox()
  const codexHome = path.join(cwd, 'custom codex home')
  const env = { ...process.env, CODEX_HOME: codexHome }
  const result = spawnSync(process.execPath, [install], { cwd, env, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(path.join(codexHome, 'skills', 'ucas-slidev', 'SKILL.md')), true)
  const explicit = path.join(cwd, 'explicit skill')
  const override = spawnSync(process.execPath, [install, '--dest', explicit], { cwd, env, encoding: 'utf8' })
  assert.equal(override.status, 0, override.stderr)
  assert.equal(existsSync(path.join(explicit, 'SKILL.md')), true)
})

test('initializer rejects an unrelated local theme before creating output', async () => {
  const cwd = await sandbox()
  const invalid = path.join(cwd, 'other theme')
  const destination = path.join(cwd, 'new report')
  await mkdir(invalid)
  await writeFile(path.join(invalid, 'package.json'), '{"name":"unrelated-theme"}')
  const result = run(init, [destination, '--theme', invalid], cwd)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /slidev-theme-ucas theme directory/)
  assert.equal(existsSync(destination), false)
})

test('installed skill is self-contained and installer refuses existing or recursive destinations', async () => {
  const cwd = await sandbox()
  const installed = path.join(cwd, 'installed skills', 'ucas-slidev')
  const first = run(install, ['--dest', installed], cwd)
  assert.equal(first.status, 0, first.stderr)
  const copiedInit = path.join(installed, 'scripts', 'init_deck.mjs')
  const destination = path.join(cwd, 'from installed skill')
  assert.equal(run(copiedInit, [destination], cwd).status, 0)
  assert.equal(await readFile(path.join(destination, 'slides.md'), 'utf8'), await readFile(path.join(skill, 'assets', 'starter.md'), 'utf8'))
  assert.equal(await readFile(path.join(installed, 'references', 'layouts.md'), 'utf8'), await readFile(path.join(skill, 'references', 'layouts.md'), 'utf8'))
  await writeFile(path.join(installed, 'SKILL.md'), 'User customization')
  const repeat = run(install, ['--dest', installed], cwd)
  assert.notEqual(repeat.status, 0)
  assert.equal(await readFile(path.join(installed, 'SKILL.md'), 'utf8'), 'User customization')
  const recursive = run(install, ['--dest', path.join(skill, 'nested-install-check')], cwd)
  assert.notEqual(recursive.status, 0)
  assert.equal(existsSync(path.join(skill, 'nested-install-check')), false)
})


test('style selection rejects unknown styles before writing output', async () => {
  const cwd = await sandbox()
  const destination = path.join(cwd, 'night report')
  const result = run(init, [destination, '--style', 'night', '--theme', root], cwd)
  assert.equal(result.status, 0, result.stderr)
  assert.match(await readFile(path.join(destination, 'slides.md'), 'utf8'), /style: night/)
  const invalid = path.join(cwd, 'invalid style')
  assert.notEqual(run(init, [invalid, '--style', 'unknown'], cwd).status, 0)
  assert.equal(existsSync(invalid), false)
})
