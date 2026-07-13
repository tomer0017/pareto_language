# CLAUDE.md — Project instructions for Claude Code

This is the primary project-wide instruction file for AI coding sessions on READY.

## Required reading

Before any change, read the living docs in order:
1. `docs/READY_MASTER_OVERVIEW.md` — what READY is, why, how, the rules, current status.
2. `docs/READY_PROJECT_STRUCTURE.md` — product rules + app/architecture detail.
3. `docs/STATUS.md` — build report / what's done.
4. `docs/ARCHITECTURE.md` — technical structure.

After a sprint, update the living docs (see each file's §living-document note) and regenerate
generated docs (`npm run gen:conversations` if Bootcamp content changed).

## Verification (run before reporting done)

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run smoke
```

Do not weaken types, skip tests, or suppress failures.

## Git Workflow (Mandatory)

- Never create a new git branch.
- Never switch branches.
- Never create a pull request.
- Never rewrite git history.
- Never decide on a branching strategy yourself.
- Always work only on the branch that is currently checked out.
- Never run git checkout to another branch.
- Never run git switch.
- Never run git rebase unless explicitly instructed.
- Never merge branches unless explicitly instructed.
- Never push to another branch.
- Assume this repository is maintained by a single developer.
- All implementation work must remain on the current checked-out branch.
