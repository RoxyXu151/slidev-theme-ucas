import { test, expect } from '@playwright/test'
import { inspectSlide } from '../.agents/skills/ucas-slidev/scripts/lib/checks.mjs'
const expected = [
  ['cover','minimal-blue'],['toc','minimal-blue'],['section','minimal-blue'],['default','minimal-blue'],['cover','minimal-red'],['cover','minimal-green'],
  ['cover','tech'],['toc','tech'],['section','tech'],['image-left','tech'],['image-right','tech'],['steps','tech'],['compare','minimal-blue'],['grid','minimal-green'],
  ['focus','minimal-blue'],['focus','night'],['cover','diagonal'],['figure','diagonal'],['cover','night'],['gallery','night'],['cover','autumn'],['image-left','autumn'],['cover','sunset'],['default','sunset'],['two-cols','tech'],['cover','tech'],
]
for (const [i,[layout,style]] of expected.entries()) test(`page ${i+1}: ${layout} / ${style}`, async ({ page }) => {
  const errors: string[] = [], external: string[] = []
  page.on('pageerror',e=>errors.push(e.message))
  page.on('console',m=>{ if(m.type()==='error')errors.push(m.text()) })
  page.on('request',r=>{if(/^https?:/.test(r.url()) && new URL(r.url()).hostname !== 'localhost')external.push(r.url())})
  await page.goto(`/${i+1}`)
  const root=page.locator(`#slide-content .slidev-page-${i+1} .slidev-layout`)
  await expect(root).toHaveClass(new RegExp(`ucas-${layout}`))
  await expect(root).toHaveClass(new RegExp(`ucas-style-${style}`))
  await expect(root.locator('h1')).toBeVisible()
  await page.evaluate(()=>document.fonts.ready)
  await expect.poll(()=>root.locator('img').evaluateAll(imgs=>imgs.every(im=>(im as HTMLImageElement).complete&&(im as HTMLImageElement).naturalWidth>0))).toBe(true)
  expect((await root.evaluate(inspectSlide)).issues).toEqual([])
  expect(errors).toEqual([]); expect(external).toEqual([])
})
test('both tables of contents navigate to the intended pages', async ({ page })=>{
  for(const [n,label,target] of [[2,'科技风与正文布局',7],[8,'侧边导航',11]] as const){
    await page.goto(`/${n}`)
    await page.locator('.ucas-toc-main').getByRole('link',{name:label,exact:true}).click()
    await expect(page).toHaveURL(new RegExp(`/${target}$`))
  }
})

test('contents numbers resolve to text for editable PowerPoint export', async ({ page })=>{
  for(const n of [2,8]){
    await page.goto(`/${n}`)
    const items=page.locator(`#slide-content .slidev-page-${n} .ucas-toc-main li`)
    await expect(items).toHaveCount(4)
    const numbers=await items.evaluateAll(items=>items.map(item=>getComputedStyle(item,'::before').content.replace(/^"|"$/g,'')))
    expect(numbers).toEqual(['01','02','03','04'])
  }
})
test('side navigation stays separate from editable content', async ({ page })=>{
  await page.goto('/11')
  const root=page.locator('.slidev-page-11 .slidev-layout')
  await expect(root).toHaveClass(/ucas-navigation-side/)
  await expect(root.locator('.ucas-nav-active')).toHaveText('方法设计')
  const box=await root.evaluate(el=>({nav:el.querySelector('header')!.getBoundingClientRect().right,body:el.querySelector('main')!.getBoundingClientRect().left}))
  expect(box.body-box.nav).toBeGreaterThan(20)
})
test('formulas, metrics, timeline, tables and code remain structured', async ({ page })=>{
  await page.goto('/15'); await expect(page.locator('#slide-content .katex').first()).toBeVisible()
  await page.goto('/16'); await expect(page.locator('#slide-content .ucas-metrics dt')).toHaveCount(3)
  await expect(page.locator('#slide-content')).toContainText('演示数据')
  await page.goto('/24'); await expect(page.locator('#slide-content .ucas-timeline > li')).toHaveCount(4)
  await page.goto('/25'); await expect(page.locator('#slide-content table')).toBeVisible(); await expect(page.locator('#slide-content pre')).toContainText('mean')
})
