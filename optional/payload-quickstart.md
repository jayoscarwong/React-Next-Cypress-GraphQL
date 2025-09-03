# Payload CMS Quickstart
1) `pnpm dlx create-payload-app`
   - Choose TypeScript + Mongo
   - Port: 3000 (default)
2) Run: `pnpm dev`
3) Create a collection `posts` with fields: `title` (text), `body` (richText)
4) Visit `http://localhost:3000/admin`, add a few posts
5) API endpoint used by Next.js: `http://localhost:3000/api/posts`
