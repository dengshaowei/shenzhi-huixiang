# Code Patterns

## Architecture Pattern

- **Primary pattern:** feature-based pages with a layered domain core.
- Page files render and forward events; `core/` owns content, evaluation and mastery; `services/` owns `wx` access.

## Data Fetching

- **Primary approach:** direct local module reads; no network fetching in MVP.
- Do not access model APIs or arbitrary URLs from pages.

## State Management

- **Persistent state:** progress repository backed by `wx` local storage.
- **Client state:** native page `data` and `setData`.
- **Forms:** controlled through `bindinput` and typed event payloads.

## Error Handling

- Normalize storage errors in the repository.
- Show user-safe messages; never claim a save succeeded after an exception.

## Validation

- Validate input length and option IDs before evaluation.
- Treat local storage as `unknown` and parse it with explicit guards.

## File and Naming Conventions

- **Files:** kebab-case.
- **Types:** PascalCase.
- **Functions/variables:** camelCase.
- **Constants:** UPPER_SNAKE_CASE.

## Testing Pattern

- Unit-test evaluator, mastery and progress parsing as pure logic.
- Manually smoke-test the complete path in WeChat DevTools.

## Change Discipline

- Keep changes focused and dependency-free where native APIs suffice.
- Do not introduce cloud, auth, database or model configuration without approval.
