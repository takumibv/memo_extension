# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension for creating sticky notes on web pages. Built with WXT, React, TypeScript, Tailwind CSS.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Design patterns (message passing, storage, content script injection, i18n, styling)
- **[docs/MIGRATION_DIFF_REPORT.md](docs/MIGRATION_DIFF_REPORT.md)** - OLD vs NEW implementation diff report

## Common Commands

### Development
```bash
pnpm dev              # Dev server (Chrome)
pnpm dev:firefox      # Dev server (Firefox)
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
```

### Testing & Quality
```bash
pnpm type-check       # Type checking
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

### Package Management
```bash
pnpm add <pkg>        # Install dependency
pnpm add -D <pkg>     # Install dev dependency
```

### Other
```bash
pnpm zip              # Create distributable zip
```

## Code Quality Rules

### TypeScript: Never use `any` type

The use of `any` type is strictly prohibited. Use proper types, `unknown` with type guards, generics, or union types instead.

## Git Rules

### Never commit directly to main

**mainブランチへの直接コミットは禁止。** 必ずfeatureブランチを作成してからコミットすること。

```bash
# ✅ 正しいワークフロー
git checkout -b fix/some-bug    # featureブランチを作成
# ... 変更 ...
git add <files>
pnpm dlx lint-staged --allow-empty
git commit -m "fix: ..."

# ❌ 絶対にやらない
git checkout main
git commit -m "..."             # mainに直コミット
```

### Pre-commit: lint-staged

Before committing, **always** run:
```bash
pnpm dlx lint-staged --allow-empty
```

Workflow: create branch → make changes → `git add` → `pnpm dlx lint-staged --allow-empty` → fix errors → re-stage → commit.
