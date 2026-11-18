# Symmetry Explorer · सममिति खोजी

ET617 End-Semester · Roll no. **24B3941** · Card **P1-T4-L1-C2** (context-aware visual learning · symmetry in everyday objects · rural Class 6–8 learner on a parent's phone · learner's own language)

- **Live app:** https://et617-24b3941.vercel.app
- **Design document and final report (D1–D8):** [DESIGN.md](DESIGN.md) · PDF: [report/Symmetry-Explorer-Report-24B3941.pdf](report/Symmetry-Explorer-Report-24B3941.pdf)
- **Live-test screenshots:** [report/screenshots/](report/screenshots/)

A mobile-first, Hindi-first web app. Learners pick an image (camera, gallery or a built-in sample), place and rotate a line of symmetry, see the reflected half and a difference map, and decide for themselves whether the symmetry is perfect, approximate or absent. It includes a short visual lesson, six assessed tasks with feedback that targets the two misconceptions, optional AI object identification, and progress saved on the device.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173  (the /api route runs on Vercel or with `vercel dev`)
npm run build        # translation coverage check + typecheck + production build
npm test             # unit tests for the AI output validator
BASE=https://et617-24b3941.vercel.app npm run test:e2e   # live D5 scenarios + screenshots (needs `npx playwright install chromium`)
npm run report:pdf   # export DESIGN.md to PDF
```

## AI configuration

Set **one** server-side variable in Vercel → Project → Settings → Environment Variables (see [.env.example](.env.example)):
`ANTHROPIC_API_KEY` (preferred; default model `claude-opus-5-5`), or `OPENAI_API_KEY`, or `GEMINI_API_KEY`. Without a key, the app shows a clearly labelled "AI not switched on" state, and the manual investigation still works fully.

## Structure

`api/analyse-image.ts` (serverless vision call + validation) · `src/pages/*` (9 screens) · `src/components/SymmetryCanvas.tsx` (interactive axis, reflection, fold) · `src/services/symmetryAnalysis.ts` (OpenCV.js / JS reflection + similarity) · `src/data/{translations,questions,sampleImages}.ts` · `public/images/samples/*.svg` (original illustrations) · `tests/` · `scripts/`

Built from the Vite `react-ts` starter. Libraries: React, React Router, Tailwind CSS, OpenCV.js, Anthropic SDK, Playwright (tests).
