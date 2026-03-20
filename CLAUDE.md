# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension for creating sticky notes on web pages. Built with React, TypeScript, Vite, Turborepo monorepo.

**Current Migration Status**: Phase 2 Complete (Background Script and Popup migrated). Next: Phase 3 (Content Script migration). See [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Monorepo structure, design patterns (message passing, storage, content script injection, i18n, Vite config, styling)
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Module names, import paths, env vars, HMR, browser compatibility, testing, migration workflow
- **[docs/I18N_GUIDE.md](docs/I18N_GUIDE.md)** - Internationalization guide

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
pnpm format           # Format code
pnpm test             # Run tests
pnpm e2e              # End-to-end tests
```

### Package Management
```bash
pnpm i <pkg> -w                 # Install in root
pnpm i <pkg> -F <module-name>   # Install in specific module (e.g., -F popup)
pnpm update-version <version>   # Update extension version
```

### Other
```bash
pnpm zip              # Create distributable zip
pnpm module-manager   # Enable/disable modules
pnpm clean:bundle     # Clean build artifacts
pnpm clean            # Full clean (including node_modules)
```

## Code Quality Rules

### TypeScript: Never use `any` type

The use of `any` type is strictly prohibited. Use proper types, `unknown` with type guards, generics, or union types instead.

**EXCEPTION**: styled-components v5 only:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SButton = (styled as any).button<Props>`...`;
```

### Git Commit Workflow

Before committing, **always** run:
```bash
pnpm dlx lint-staged --allow-empty
```

Workflow: make changes → `git add` → `pnpm dlx lint-staged --allow-empty` → fix errors → re-stage → commit.
