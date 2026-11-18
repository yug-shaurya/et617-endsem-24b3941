// Measures the visual-similarity estimate for every sample at the four preset axes.
import { chromium } from 'playwright'
const BASE = process.env.BASE || 'http://localhost:4173'
const ids = ['butterfly', 'leaf', 'flower', 'starfish', 'water-pot', 'chair', 'square', 'rectangle']
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const out = {}
for (const id of ids) {
  await page.goto(`${BASE}/source?mode=sample`)
  await page.click(`[data-testid=sample-${id}]`)
  await page.click('[data-testid=to-investigate]')
  await page.waitForSelector('[data-testid=symmetry-canvas]')
  const row = {}
  for (const a of [0, 90, 45, -45]) {
    await page.click(`[data-testid=preset-${a}]`)
    await page.waitForTimeout(250)
    row[a] = (await page.textContent('[data-testid=similarity] .text-4xl'))?.trim()
  }
  out[id] = row
}
const engine = await page.textContent('[data-testid=similarity] p.text-xs')
console.table(out)
console.log('engine:', engine)
console.log('errors:', errors)
await browser.close()
