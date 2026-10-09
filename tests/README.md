# Frontend tests

Run `npm test` for a single run, or `npm run test:watch` while developing.

Vitest and React Testing Library test rating formatting, browser authentication
storage, API success/failure handling, role-based route protection, and registration.
Network requests and Next.js navigation are mocked: no backend, database,
credentials or real accounts are required.

These unit/component tests do not verify backend authorization, real uploads,
deployment or complete customer journeys. Async Next.js Server Components and
full browser workflows still require integration/end-to-end or manual testing.
