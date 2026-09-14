# Code Patterns

## Purpose
This file defines the implementation patterns the agent should follow for this project.
Prefer these patterns over inventing new ones.

## Architecture Pattern
- **Primary pattern:** feature-based
- **Rule:** Keep domain logic separate from transport/UI concerns.
- **Rule:** Reuse existing modules before creating new abstractions.

## Data Fetching
- **Primary approach:** direct server calls
- **Rule:** Server Components may read curated local content directly. Client Components call route handlers only for server-only operations such as model evaluation.
- **Rule:** Keep fetch logic out of render functions unless the framework explicitly encourages it.

## State Management
- **Server state:** Curated TypeScript content imported in Server Components; no remote server-state library in the MVP.
- **Client state:** React state/context plus a typed progress repository backed by localStorage.
- **Forms:** Controlled React forms with Zod schemas at API boundaries; add a form library only if repeated complexity justifies it.
- **Rule:** Prefer the simplest working approach for MVP scope. Do not add a state library if React's built-in state is sufficient.

## Error Handling
- Normalize errors at service/API boundaries — never let raw exceptions reach the UI.
- Never swallow errors silently; always log or surface them.
- Return user-safe messages in the UI; log developer context server-side.
- Use `{ ok: false, error: { code, message } }` for API failures and `{ ok: true, data }` for success.

## Validation
- Validate learner forms, API payloads, provider output and environment variables.
- Apply Zod validation at system boundaries; trust internal types inside those boundaries.
- Keep validation rules next to the relevant contract in `src/lib/schemas/`.

## File and Naming Conventions
- **Files:** kebab-case
- **Components / classes:** PascalCase
- **Functions / variables:** camelCase
- **Constants / env vars:** UPPER_SNAKE_CASE

## Testing Pattern
- Add unit tests for mastery rules, schemas, fallback evaluation and storage serialization.
- Add integration tests for the evaluation route's valid, invalid and provider-failure contracts.
- Add E2E tests only for the global-map-to-unlock journey.
- Run the test suite after every feature; fix failures before moving on.

## Change Discipline
- Prefer focused, minimal edits over large rewrites.
- Do not introduce new dependencies without checking `agent_docs/tech_stack.md` and `package.json`.
- Do not change persistence, infrastructure, provider configuration or content versions without recording the decision in `MEMORY.md`.
- One feature at a time — checkpoint after each working feature.

