import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import JSZip from 'jszip'
import { verifyPptx } from '../scripts/verify_pptx.mjs'

async function fixture(xml) {
  const zip = new JSZip()
  zip.file('[Content_Types].xml','<Types><Override ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>')
  zip.file('ppt/slides/slide1.xml',xml)
  return zip.generateAsync({ type: 'nodebuffer' })
}
test('editable export verification rejects whole-slide images and lost titles', async () => {
  const native = await fixture('<p:sld><p:sp><p:txBody><a:p><a:r><a:t>研究方法</a:t></a:r></a:p></p:txBody></p:sp></p:sld>')
  assert.equal((await verifyPptx(native,{expectedSlides:1,titles:['研究方法'],requireText:true})).editableSlides,1)
  await assert.rejects(verifyPptx(await fixture('<p:sld><p:cSld><p:bg><a:blip/></p:bg></p:cSld></p:sld>'),{requireText:true}),/no editable text/)
  await assert.rejects(verifyPptx(native,{titles:['实验结果']}),/lost its editable title/)
  await assert.rejects(verifyPptx(native,{expectedSlides:2}),/slide count/)
  await assert.rejects(verifyPptx(await fixture('<p:sld><p:sp><a:t>counter(ucas-toc, decimal-leading-zero)</a:t></p:sp></p:sld>')),/unresolved CSS counter/)
})
test('theme and export commands default to editable PPTX while PDF remains explicit', async () => {
  const manifest=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'))
  assert.equal(manifest.slidev.defaults.export.format,'pptx-editable')
  assert.match(manifest.scripts.export,/--format pptx-editable --output slides\.pptx$/)
  assert.match(manifest.scripts['export:pdf'],/--format pdf --output slides\.pdf$/)
  assert.match(manifest.scripts['export:example'],/--format pptx-editable/)
})

test('an installed skill verifies native text and rejects image-only exports outside the repository', async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ucas-portable-export-'))
  const run = (file, args) => spawnSync(process.execPath, [file, ...args], { cwd, encoding: 'utf8' })
  try {
    const installed = path.join(cwd, 'installed skill')
    const deck = path.join(cwd, 'independent deck')
    let result = run(path.join(root, '.agents/skills/ucas-slidev/scripts/install_skill.mjs'), ['--dest', installed])
    assert.equal(result.status, 0, result.stderr)
    result = run(path.join(installed, 'scripts/init_deck.mjs'), [deck])
    assert.equal(result.status, 0, result.stderr)
    // Supply the same runtime dependencies an independent npm install provides.
    await symlink(path.join(root, 'node_modules'), path.join(deck, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
    const source = path.join(deck, 'slides.md'), pptx = path.join(deck, 'slides.pptx')
    await writeFile(source, '# 研究方法\n')
    await writeFile(pptx, await fixture('<p:sld><p:sp><p:txBody><a:p><a:r><a:t>研究方法</a:t></a:r></a:p></p:txBody></p:sp></p:sld>'))
    const script = path.join(deck, 'scripts/verify_pptx.mjs')
    const args = [pptx, '--source', source, '--require-text']
    result = run(script, args)
    assert.equal(result.status, 0, result.stderr)
    assert.equal(JSON.parse(result.stdout).editableSlides, 1)
    await writeFile(pptx, await fixture('<p:sld><p:pic/></p:sld>'))
    result = run(script, args)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /no editable text/)
  }
  finally { await rm(cwd, { recursive: true, force: true }) }
})
