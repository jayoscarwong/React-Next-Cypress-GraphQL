# Fullstack Intro Demo Repo (v2)

## Run
pnpm install
pnpm dev:api   # API on 4000 (Express + GraphQL at /graphql)
pnpm dev:web   # Web on 3001 (Next.js pages demo)

## Pages
/              -> CMS fetch (works even if CMS is off; shows empty list)
/post/123      -> dynamic route demo
/hello         -> fetches Express JSON
/gql           -> queries GraphQL endpoint at http://localhost:4000/graphql

## Tests
pnpm test      # Jest unit test
pnpm approve-builds && pnpm rebuild -r && pnpm cypress  # Cypress E2E

