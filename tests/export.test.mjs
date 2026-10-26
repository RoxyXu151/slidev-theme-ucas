import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
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
