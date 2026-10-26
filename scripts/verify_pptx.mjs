import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import JSZip from 'jszip'

const decodeXml = text => text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
  if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2),16) : Number(entity.slice(1)))
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity]
})
const compact = text => decodeXml(text).replace(/<[^>]+>/g, '').normalize('NFKC').replace(/[\s`*_\u200b-\u200d\ufeff]/g, '')

/** Verify real DrawingML text, rather than accepting image-only slide backgrounds. */
export async function verifyPptx(input, { expectedSlides, titles = [], requireText = false } = {}) {
  const zip = await JSZip.loadAsync(input)
  const contentTypes = await zip.file('[Content_Types].xml')?.async('string')
  if (!contentTypes?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml')) throw new Error('Not a PowerPoint presentation')
  const files = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a,b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]))
  if (!files.length || (expectedSlides !== undefined && files.length !== expectedSlides)) throw new Error(`Unexpected slide count: ${files.length}, expected ${expectedSlides ?? 'at least one'}`)
  const slides = []
  for (const [index, file] of files.entries()) {
    const xml = await zip.file(file).async('string')
    const shapes = [...xml.matchAll(/<p:sp(?:\s[^>]*)?>[\s\S]*?<\/p:sp>/g)].map(match => match[0])
    const texts = shapes.flatMap(shape => [...shape.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map(match => decodeXml(match[1]))).filter(text => text.trim())
    const text = texts.join('')
    if (requireText && !texts.length) throw new Error(`Slide ${index+1} has no editable text; it may be an image-only fallback`)
    if (titles[index] && !compact(text).includes(compact(titles[index]))) throw new Error(`Slide ${index+1} lost its editable title: ${titles[index]}`)
    if (text.includes('counter(ucas-toc')) throw new Error(`Slide ${index+1} contains an unresolved CSS counter`)
    slides.push({ slide: index+1, textRuns: texts.length, pictures: (xml.match(/<p:pic(?:\s|>)/g) || []).length })
  }
  return { slideCount: files.length, editableSlides: slides.filter(slide => slide.textRuns > 0).length, textRuns: slides.reduce((n,slide) => n+slide.textRuns,0), slides }
}

async function main() {
  const args = process.argv.slice(2), file = args.shift()
  if (!file) throw new Error('Usage: node scripts/verify_pptx.mjs <file.pptx> [--source slides.md] [--require-text]')
  let source, requireText = false
  for (let i=0; i<args.length; i++) {
    if (args[i] === '--require-text') requireText = true
    else if (args[i] === '--source' && args[i+1]) source = path.resolve(args[++i])
    else throw new Error(`Unknown argument: ${args[i]}`)
  }
  let expectedSlides, titles
  if (source) {
    const { load } = await import('@slidev/parser/fs')
    const cwd = path.dirname(source)
    const data = await load({ roots: [cwd], userRoot: cwd }, source)
    expectedSlides = data.slides.length
    // Frontmatter title is document metadata and may differ from the visible heading.
    titles = data.slides.map(slide => /^#\s+(.+)$/m.exec(slide.content)?.[1] || '')
  }
  const result = await verifyPptx(await readFile(file), { expectedSlides, titles, requireText })
  console.log(JSON.stringify(result))
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1 })
