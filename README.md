# HPL Pure Mathematics

A [Next.js](https://nextjs.org) site (App Router) using TypeScript and
Tailwind CSS v4, for Cambridge A Level Pure Mathematics (9709).

## Getting started

Install dependencies, then start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Editing
`src/app/page.tsx` updates the page as you save.

## Scripts

| Command         | Does                                 |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Build for production                 |
| `npm start`     | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Layout

```
src/app/        routes, layout and global styles
public/         static assets
```

The `@/*` import alias points at `src/`.
