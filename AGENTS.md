# Project Guidelines

## Quality Bar

- Never downgrade any existing code file.
- Do not replace stronger typing, validation, security, architecture, tests, or error handling with weaker versions.
- If a file is touched, preserve or improve its current quality level. Default direction is enterprise-grade.
- Prefer explicit types, shared DTOs and contracts, input validation, secure defaults, actionable errors, and clear module boundaries.
- Preserve public APIs unless a change is explicitly requested.

## Architecture

- Each package exposes its public API through src/index.ts only.
- Do not deep-import across package boundaries.
- Browser apps must never use SUPABASE_SERVICE_ROLE_KEY or payment secret keys.
- Founder-root actions, payouts, reservation locking, and QR rotation remain API-only.
- Use RLS for normal user data boundaries, but not as the only line of defense for privileged workflows.

## Build And Test

- Use pnpm workspace commands from the repository root.
- Validate changed files with diagnostics and relevant lint or typecheck commands when practical.

## Conventions

- Favor backward-compatible changes unless a breaking change is explicitly requested.
- Prefer strengthening code with better typing, validation, observability, and security rather than simplifying by removing safeguards.
