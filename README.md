# Repo Explainer

Repo Explainer is a work-in-progress, code-grounded repository explainer. **Current state: UI preview and typed architecture contracts only.** It does not yet analyze GitHub repositories, generate AI summaries, or synthesize narration. The on-screen graph is explicitly labelled sample data.

## Run

Requires Node.js 22+ and npm. From the repository root:

```bash
npm install
npm run dev
```

Open http://localhost:3000. The Next.js app is in `apps/web` and can be deployed to Vercel with **Root Directory** `apps/web`. The long-running worker must run separately from Vercel.

## Architecture

- `apps/web`: Next.js 16 frontend and sketch canvas preview.
- `apps/worker`: separate Node worker scaffold, not yet connected to a queue.
- `packages/schema`: Zod FactSheet and SceneScript contracts with referential integrity checks.
- `packages/analyze`: parser plugin contract, path resolution and graph integrity helpers.
- `packages/ai`: LLM/TTS provider contracts and deterministic ID verifier.
- `packages/render`: sketch design tokens.

## Security

Do not execute untrusted repository code. Never pass secrets to client components. Parsing, queueing, provider integrations, caching and production verification remain to be implemented.
