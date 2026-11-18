// Translation coverage check: every entry in translations.ts and every Bi object
// in questions.ts / sampleImages.ts must have non-empty hi AND en, and hi must be Devanagari.
import { readFileSync } from 'node:fs'

const files = ['src/data/translations.ts', 'src/data/questions.ts', 'src/data/sampleImages.ts']
let errors = 0
let count = 0
const DEV = /[\u0900-\u097F]/
// Keys whose Hindi value is legitimately not Devanagari (labels/symbols)
const ALLOW_NON_DEV = new Set(['A', 'B', 'C', '1', '2', '3'])
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const re = /\{\s*hi:\s*(['"`])((?:\.|(?!\1).)*)\1\s*,\s*en:\s*(['"`])((?:\.|(?!\3).)*)\3\s*\}/gs
  let m
  while ((m = re.exec(src))) {
    count++
    const hi = m[2].trim(), en = m[4].trim()
    if (!hi || !en) { errors++; console.error(`${f}: empty value near "${hi || en}"`) }
    else if (!DEV.test(hi) && !ALLOW_NON_DEV.has(hi)) { errors++; console.error(`${f}: Hindi text has no Devanagari: "${hi}"`) }
  }
  // any `hi:` without a matching `en:` on the same object
  const his = (src.match(/\bhi:\s*['"`]/g) || []).length
  const ens = (src.match(/\ben:\s*['"`]/g) || []).length
  if (his !== ens) { errors++; console.error(`${f}: ${his} hi values vs ${ens} en values`) }
}
// UI keys used in code must exist in the dictionary
const dict = readFileSync('src/data/translations.ts', 'utf8')
const keys = new Set([...dict.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]))
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))
for (const f of walk('src').filter((x) => x.endsWith('.tsx'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\bt\('(\w+)'\)/g)) {
    if (!keys.has(m[1])) { errors++; console.error(`${f}: missing translation key "${m[1]}"`) }
  }
}
console.log(`Checked ${count} bilingual strings and ${keys.size} UI keys: ${errors ? errors + ' problem(s)' : 'all complete'}`)
process.exit(errors ? 1 : 0)
