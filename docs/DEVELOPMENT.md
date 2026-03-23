# Development Guide

## Module Names
When installing dependencies with `pnpm i <package> -F <module>`, use the `name` field from the module's `package.json`. You can omit the `@extension/` prefix (e.g., use `popup` instead of `@extension/popup`).

## Import Paths
- Use `@extension/*` for cross-package imports
- Each module defines its own aliases (e.g., `@src`, `@root`, `@assets`)
- Example: `import { t } from '@extension/i18n'`

## Environment Variables
- Environment variables are managed in the `packages/env/` package
- Variables prefixed with `CEB_*` or `CLI_CEB_*` are globally available
- Use `pnpm set-global-env` to configure environment

## Hot Module Reload (HMR)
- The custom HMR plugin (`packages/hmr/`) enables live reloading during development
- Set `CLI_CEB_DEV=true` to enable HMR (automatically done by `pnpm dev`)
- If HMR freezes, restart the dev server: Ctrl+C then `pnpm dev`

## Browser Compatibility
- Primary target: Chrome/Chromium (Manifest V3)
- Firefox support via `pnpm dev:firefox` and `pnpm build:firefox`
- Firefox-specific manifest adjustments handled automatically
- sidePanel permission removed for Firefox (not supported)

## Testing

The project uses Vitest for unit and component testing:

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

**Important: Adding vitest config files**

When creating new `vitest.config.ts` or `vitest.setup.ts` files, **you must add them to eslint ignores** to avoid pre-commit hook failures:

1. Edit `eslint.config.ts`
2. Add the files to the `ignores` array (already includes `**/vitest.config.ts` and `**/vitest.setup.ts`)
3. If you add vitest files in new locations not covered by wildcards, add them explicitly

**Test file locations:**
- Place test files in `__tests__/` directories or co-locate with source files using `.test.ts` or `.spec.ts` suffix
- Setup files: `vitest.setup.ts` in each package root
- Config files: `vitest.config.ts` in each package root
- Shared config: `vitest.config.shared.ts` in project root

**Chrome API Mocking:**
- Background scripts use custom Chrome API mocks (see `chrome-extension/vitest.setup.ts`)
- React components use jsdom environment
- All mocks are automatically cleared between tests

## Working with the Migration
This codebase is actively migrating from Webpack to Vite. The `old/` directory contains the original Webpack-based code for reference. When implementing new features or migrating components:

1. Check `MIGRATION_PLAN.md` for current phase and status
2. Follow the established patterns in already-migrated code (background, popup)
3. Ensure `pnpm build` succeeds after any changes
4. Use `@extension/*` imports consistently for migrated code
