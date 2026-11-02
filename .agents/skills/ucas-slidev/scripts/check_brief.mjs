#!/usr/bin/env node
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const requiredFields = [
  '用途',
  '听众',
  '场景与时长',
  '页数',
  '目标结果',
  '核心结论',
  '叙事模式',
  '视觉风格',
  '导航',
  '交付物',
  '必须保留',
  '必须排除',
  '来源边界',
]
const narratives = new Set(['paper-review', 'progress-review', 'thesis-defense', 'instructional', 'neutral-briefing'])
const styles = new Set(['minimal-blue', 'minimal-red', 'minimal-green', 'tech', 'diagonal', 'night', 'autumn', 'sunset', 'ime'])
const navigations = new Set(['top', 'side', 'none'])
const layouts = new Set(['cover', 'toc', 'section', 'default', 'two-cols', 'compare', 'image-left', 'image-right', 'figure', 'grid', 'steps', 'focus', 'gallery', 'end'])

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function field(markdown, name) {
  const match = markdown.match(new RegExp(`^-\\s*${escapeRegExp(name)}[：:]\\s*(.*)$`, 'm'))
  return match?.[1]?.trim() || ''
}

function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
}

export function validateBrief(markdown, { slidesCount, deckStyle } = {}) {
  const errors = []
  const values = Object.fromEntries(requiredFields.map(name => [name, field(markdown, name)]))
  for (const name of requiredFields) {
    if (!values[name]) errors.push(`缺少字段：${name}`)
    else if (values[name].includes('[待补充')) errors.push(`${name} 仍含待补充内容`)
  }

  if (values['叙事模式'] && !narratives.has(values['叙事模式'])) errors.push(`未知叙事模式：${values['叙事模式']}`)
  if (values['视觉风格'] && !styles.has(values['视觉风格'])) errors.push(`未知视觉风格：${values['视觉风格']}`)
  if (deckStyle && values['视觉风格'] && values['视觉风格'] !== deckStyle) errors.push(`简报视觉风格为 ${values['视觉风格']}，slides.md 使用 ${deckStyle}`)
  if (values['导航'] && !navigations.has(values['导航'])) errors.push(`未知导航方式：${values['导航']}`)

  const declaredPages = Number(values['页数'])
  if (values['页数'] && (!Number.isInteger(declaredPages) || declaredPages < 1)) errors.push(`页数必须是正整数：${values['页数']}`)

  const lines = markdown.split(/\r?\n/)
  const headerIndex = lines.findIndex(line => /^\|\s*页\s*\|/.test(line))
  if (headerIndex < 0) {
    errors.push('缺少逐页计划表')
  }
  else {
    const expectedHeaders = ['页', '角色', '叙事阶段', '主要观点', '证据或来源', '布局']
    const headers = tableCells(lines[headerIndex])
    if (headers.join('|') !== expectedHeaders.join('|')) errors.push(`逐页计划表头应为：${expectedHeaders.join(' | ')}`)
    const rows = []
    for (let index = headerIndex + 2; index < lines.length && lines[index].startsWith('|'); index++) {
      const cells = tableCells(lines[index])
      if (cells.length !== expectedHeaders.length) {
        errors.push(`逐页计划第 ${index + 1} 行列数不正确`)
        continue
      }
      const [page, role, stage, claim, evidence, layout] = cells
      rows.push({ page: Number(page), role, stage, claim, evidence, layout })
      if (!Number.isInteger(Number(page)) || Number(page) < 1) errors.push(`逐页计划页码无效：${page}`)
      for (const [label, value] of [['角色', role], ['叙事阶段', stage], ['主要观点', claim], ['布局', layout]]) {
        if (!value || value.includes('[待补充')) errors.push(`第 ${page} 页的${label}未完成`)
      }
      if (!evidence || evidence.includes('[待补充')) errors.push(`第 ${page} 页的证据或来源未完成；没有证据时可填“无”`)
      if (layout && !layouts.has(layout)) errors.push(`第 ${page} 页使用未知布局：${layout}`)
    }
    rows.forEach((row, index) => {
      if (row.page !== index + 1) errors.push(`逐页计划页码应从 1 连续排列；第 ${index + 1} 行是 ${row.page}`)
    })
    if (Number.isInteger(declaredPages) && rows.length !== declaredPages) errors.push(`页数为 ${declaredPages}，逐页计划有 ${rows.length} 行`)
    if (slidesCount !== undefined && rows.length !== slidesCount) errors.push(`slides.md 有 ${slidesCount} 页，逐页计划有 ${rows.length} 行`)
    values.pages = rows
  }

  return { ok: errors.length === 0, errors, values }
}

async function readDeck(entry) {
  const cwd = path.dirname(entry)
  const require = createRequire(path.join(cwd, 'package.json'))
  let parserPath
  try { parserPath = require.resolve('@slidev/parser/fs') }
  catch { throw new Error('无法读取 slides.md 页数；请先在演示目录运行 npm install') }
  const { load } = await import(pathToFileURL(parserPath).href)
  const data = await load({ roots: [cwd], userRoot: cwd }, entry)
  const first = data.slides[0]?.frontmatter || {}
  return { slidesCount: data.slides.length, deckStyle: first.themeConfig?.style || first.style }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--help')) {
    console.log('Usage: node check_brief.mjs [brief.md] [slides.md] [--no-slides]\n检查沟通契约、叙事模式、视觉锁定和逐页计划；默认同时核对 slides.md 页数。')
    return
  }
  const noSlides = args.includes('--no-slides')
  const positional = args.filter(arg => !arg.startsWith('--'))
  if (positional.length > 2 || args.some(arg => arg.startsWith('--') && arg !== '--no-slides')) throw new Error('未知参数')
  const briefEntry = path.resolve(positional[0] || 'brief.md')
  const slidesEntry = path.resolve(positional[1] || 'slides.md')
  const markdown = await readFile(briefEntry, 'utf8')
  const deck = noSlides ? {} : await readDeck(slidesEntry)
  const result = validateBrief(markdown, deck)
  if (result.errors.length) {
    for (const error of result.errors) console.error(`错误：${error}`)
    console.error(`简报检查失败：${result.errors.length} 项错误。`)
    process.exitCode = 1
    return
  }
  console.log(`简报检查通过：${result.values.pages.length} 页，叙事模式 ${result.values['叙事模式']}，风格 ${result.values['视觉风格']}。`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch(error => { console.error(`检查未完成：${error.message}`); process.exitCode = 2 })
