# Tech Stack & Tools

- **Frontend:** Next.js App Router + React + strict TypeScript; exact versions are the locked stable versions in `package-lock.json` after scaffold.
- **Backend:** Next.js route handlers on the Node.js runtime.
- **Database:** None in the MVP; typed content in source and progress behind a localStorage repository.
- **Styling:** Tailwind CSS plus CSS custom properties for design tokens.
- **Knowledge graph:** `@xyflow/react` with custom nodes and responsive fallback views.
- **Validation:** Zod for user input, environment and provider response schemas.
- **Authentication:** None for visitor demo.
- **AI:** Provider-neutral server adapter; configured through environment variables; deterministic fallback evaluator when unavailable.
- **Deployment:** Vercel-compatible production build.

## Setup Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Use `npm`; do not mix package managers. The committed lockfile is the version authority.

## Environment Contract

```text
AI_PROVIDER=optional-provider-name
AI_MODEL=optional-model-family
AI_API_KEY=server-only-secret
```

The application must start and complete its core journey with all three variables absent. Never expose `AI_API_KEY` to client code.

## Error Handling Pattern

```ts
import { z } from "zod";

const requestSchema = z.object({ answer: z.string().trim().min(1).max(4000) });

export function parseEvaluationRequest(input: unknown) {
  const result = requestSchema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, error: { code: "INVALID_INPUT", message: "请先完成你的解释。" } };
  }
  return { ok: true as const, data: result.data };
}
```

## Styling & Component Examples

```tsx
type StatusCardProps = {
  title: string;
  status: "locked" | "available" | "learning" | "mastered";
  evidence?: string;
};

export function StatusCard({ title, status, evidence }: StatusCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-widest text-cyan-300">{status}</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      {evidence ? <p className="mt-3 text-sm text-slate-300">{evidence}</p> : null}
    </section>
  );
}
```

