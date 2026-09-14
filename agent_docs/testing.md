# Testing Strategy

## Frameworks
- **Unit Tests:** Vitest + Testing Library
- **E2E Tests:** Playwright for the single critical journey after core screens exist

## Rules & Requirements
- **Coverage:** Aim for 80% code coverage on mastery rules, schemas, fallback evaluation and storage serialization.
- **Before Commit:** Always run `npm test && npm run lint && npm run build` before verifying a task is complete.
- **Failures:** NEVER skip tests or weaken assertions to make a pipeline pass without human approval. Fix the product or test contract.

## Execution
- Command to run all tests: `npm test`
- Command to run a single test file: `npm test -- path/to/file.test.ts`
- Command to run E2E tests once configured: `npm run test:e2e`

## Critical Cases
- Valid, empty, too-long and malformed evaluation requests.
- Provider success, timeout, malformed structured output and missing-key fallback.
- Correct response unlocks; critical misconception blocks unlock.
- Progress round-trips through storage and survives refresh.
- Overview → detailed map → lesson → challenge → evidence → unlock → case flow.

