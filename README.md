# Endsem

A Next.js app using the App Router, TypeScript, Tailwind CSS, and ESLint.

## Requirements

- Node.js 20.9 or newer
- npm

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Edit `src/app/page.tsx` to change the home page.

Run the production checks before deploying:

```bash
npm run lint
npm run build
```

## Deploy to Vercel

The Vercel CLI is installed globally on the development machine. Sign in, then link this folder to a Vercel project and deploy:

```bash
vercel login
vercel
vercel --prod
```

The first `vercel` run guides you through creating or linking a project. Later production deployments use `vercel --prod`.
