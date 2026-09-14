# Testing Strategy

## Frameworks

- **Unit Tests:** Vitest for pure TypeScript modules
- **E2E Tests:** Manual WeChat DevTools smoke test for the MVP

## Rules & Requirements

- **Coverage:** Critical evaluator, mastery and storage parsing branches must be covered.
- **Before Completion:** Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run typecheck:mini`.
- **Failures:** Never skip assertions or hide errors to make verification pass.

## Execution

- All tests: `npm test`
- One test: `npx vitest run miniprogram/core/evaluator.test.ts`
- Mini-program types: `npm run typecheck:mini`

## Manual Smoke Test

1. Switch across all four tabs.
2. Open the sensor lesson and mark it complete.
3. Submit a wrong challenge and verify the node stays locked.
4. Submit the correct challenge and a complete explanation; verify evidence and unlock.
5. Complete the robot case and verify Profile history.
6. Close/reopen and verify persistence; reset and verify cleared state.
