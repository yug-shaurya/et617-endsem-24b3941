// Exports DESIGN.md (the final report) to report/Symmetry-Explorer-Report-24B3941.pdf
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { marked } from 'marked'
import { chromium } from 'playwright'

const md = readFileSync('DESIGN.md', 'utf8')
const body = marked.parse(md)
const html = `<!doctype html><html lang="hi"><head><meta charset="utf-8"><base href="${pathToFileURL(process.cwd()).href}/">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>
body{font-family:'Noto Sans Devanagari',system-ui,sans-serif;font-size:10.5pt;line-height:1.5;color:#263238;margin:0}
h1{color:#22543D;border-bottom:3px solid #2F855A;padding-bottom:4px;margin-top:28px;page-break-after:avoid}
h1:not(:first-of-type){page-break-before:always}
h2{color:#2F855A;margin-top:18px}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:9.5pt}
td,th{border:1px solid #cfe3d6;padding:4px 6px;vertical-align:top}
th{background:#E6F4EA}
code,pre{font-size:8.5pt;background:#f4f6f5}
pre{padding:8px;white-space:pre-wrap;border-radius:6px}
img{max-width:100%}
table img{max-height:300px;width:auto;display:block;margin:auto}
p>img{max-height:420px;display:block;margin:auto}
footer{position:fixed;bottom:0}
</style></head><body>${body}</body></html>`
writeFileSync('report/report.html', html)
if (process.env.HTML_ONLY) process.exit(0)
const b = await chromium.launch()
const p = await b.newPage()
await p.goto(pathToFileURL(process.cwd() + '/report/report.html').href, { waitUntil: 'networkidle' })
await p.pdf({ path: 'report/Symmetry-Explorer-Report-24B3941.pdf', format: 'A4', margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' }, printBackground: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#667085">Symmetry Explorer · ET617 · 24B3941 · P1-T4-L1-C2 · <span class="pageNumber"></span>/<span class="totalPages"></span></div>' })
await b.close()
console.log('PDF written')
