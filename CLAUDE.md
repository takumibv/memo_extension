# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension for creating sticky notes on web pages, built with React, TypeScript, and Vite using a Turborepo monorepo structure. The extension is currently undergoing migration from Webpack to Vite (see [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for details).

**Current Migration Status**: Phase 2 Complete (Background Script and Popup migrated). Next: Phase 3 (Content Script migration).

## Common Commands

### Development
```bash
# Start development server (Chrome)
pnpm dev

# Start development server (Firefox)
pnpm dev:firefox

# Build for production (Chrome)
pnpm build

# Build for production (Firefox)
pnpm build:firefox
```

### Testing & Quality
```bash
# Type checking
pnpm type-check

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# End-to-end tests
pnpm e2e
```

### Package Management
```bash
# Install dependency in root
pnpm i <package> -w

# Install dependency in specific module
pnpm i <package> -F <module-name>
# Example: pnpm i lodash -F popup

# Update extension version
pnpm update-version <version>
```

### Other
```bash
# Create distributable zip
pnpm zip

# Enable/disable modules
pnpm module-manager

# Clean build artifacts
pnpm clean:bundle

# Full clean (including node_modules)
pnpm clean
```

## Architecture

### Monorepo Structure

This project uses **Turborepo** to manage multiple packages and pages. The key directories are:

#### `chrome-extension/`
Contains the core Chrome extension configuration:
- `manifest.ts` - Generates the manifest.json file
- `src/background/` - Service worker for the extension
- `src/message/` - Message passing system between different extension contexts
  - `actions.ts` - Message type constants
  - `sender/` - Functions to send messages (background, popup, options, contentScript)
  - `handler/` - Message handlers in the background script
- `public/` - Static assets (icons, CSS)

#### `pages/`
Individual UI pages of the extension, each built separately:
- `popup/` - Extension toolbar popup
- `options/` - Settings/options page
- `content/` - Content script injected into web pages
- `content-ui/` - React UI components injected into pages
- `content-runtime/` - Dynamically injected content scripts
- `devtools/` and `devtools-panel/` - Developer tools integration
- `new-tab/` - Custom new tab page
- `side-panel/` - Chrome side panel (114+)

Each page has its own `vite.config.mts` using `withPageConfig` helper.

#### `packages/`
Shared packages used across the extension:
- `shared/` - Shared components, hooks, utils, types, and storage logic
  - `lib/components/` - React components (Button, Icon)
  - `lib/hooks/` - Custom React hooks (useNote, useStorage)
  - `lib/storages/` - Chrome storage wrappers (noteStorage, pageInfoStorage, etc.)
  - `lib/types/` - TypeScript type definitions (Note, PageInfo, Setting)
  - `lib/utils/` - Utility functions (utils.ts, resetCSS.ts, const.ts)
- `storage/` - Chrome storage API abstractions
- `vite-config/` - Shared Vite configuration
- `hmr/` - Hot Module Reload plugin for development
- `i18n/` - Internationalization utilities
- `ui/` - UI utilities and Tailwind config merging
- `tailwind-config/` - Shared Tailwind configuration
- `tsconfig/` - Shared TypeScript configuration
- `env/` - Environment variable management
- `dev-utils/` - Development utilities (manifest parser, logger)
- `zipper/` - Creates distributable zip files
- `module-manager/` - CLI tool to enable/disable extension modules

### Key Design Patterns

#### Message Passing System
The extension uses Chrome's message passing API to communicate between different contexts:

1. **Senders** (`chrome-extension/src/message/sender/`):
   - Each context (popup, options, content script, background) has its own sender module
   - Senders use `chrome.runtime.sendMessage()` or `chrome.tabs.sendMessage()`
   - Example: `popup.ts` contains functions like `sendCreateNote()`, `sendDeleteNote()`

2. **Handlers** (`chrome-extension/src/message/handler/background.ts`):
   - Background script has a central `handleMessages()` function
   - Routes messages based on `senderType` (POPUP, OPTIONS, CONTENT_SCRIPT)
   - Calls appropriate action functions from `background/actions.ts`

3. **Actions** (`chrome-extension/src/message/actions.ts`):
   - Defines message type constants: `CREATE_NOTE`, `UPDATE_NOTE`, `DELETE_NOTE`, etc.
   - Also defines sender type constants: `POPUP`, `OPTIONS`, `CONTENT_SCRIPT`, etc.

#### Storage Architecture
Storage is managed through a layered approach:

1. **Storage Utilities** (`packages/shared/lib/storages/`):
   - `common.ts` - Low-level Chrome storage API wrappers (`getStorage`, `setStorage`, `removeStorage`)
   - `noteStorage.ts` - CRUD operations for notes (createNote, updateNote, deleteNote, getAllNotesByPageId)
   - `pageInfoStorage.ts` - Manages page metadata (URL, title, etc.)
   - `noteVisibleStorage.ts`, `defaultColorStorage.ts` - User preferences

2. **Background Actions** (`chrome-extension/src/background/actions.ts`):
   - Higher-level functions that orchestrate storage operations
   - Handles badge updates, settings management
   - Called by message handlers

3. **Cache** (`chrome-extension/src/background/cache.ts`):
   - In-memory cache for badge counts per tab
   - Prevents unnecessary storage reads on tab switches

#### Content Script Injection
Dynamic content script injection is handled in `background/index.ts`:

1. **Tab Lifecycle Management**:
   - `chrome.tabs.onUpdated` - Injects scripts and sets up page state when URL changes
   - `chrome.tabs.onActivated` - Updates badge count
   - `chrome.tabs.onRemoved` - Cleans up cache

2. **Injection Functions** (in `message/handler/background.ts`):
   - `isScriptAllowedPage()` - Checks if scripts can be injected
   - `hasContentScript()` - Checks if content script already exists
   - `injectContentScript()` - Injects content script only if needed
   - `setupPage()` - Sends notes and settings to content script

3. **Context Menu Integration**:
   - Allows creating notes via right-click menu
   - Follows same injection pattern

#### i18n (Internationalization)
Uses Chrome Extension i18n API with type-safe TypeScript constants:

- **Languages**: en, ja, ko, de, es, fr, it, zh_CN
- **Usage**:
  ```typescript
  import { t } from '@extension/i18n';
  import { I18N } from '@extension/shared/lib/i18n/keys';

  const message = t(I18N.WELCOME); // Type-safe, IDE autocomplete
  ```
- **Update**: Run `pnpm generate:i18n-keys` after editing `messages.json`
- **Documentation**: See [docs/I18N_GUIDE.md](docs/I18N_GUIDE.md)

### Vite Configuration

#### Page Configuration (`packages/vite-config/`)
- `withPageConfig()` helper provides common Vite config for all pages
- Includes React plugin, HMR setup, and shared build settings
- Individual pages extend this with specific aliases and output directories

#### Chrome Extension Build
- Background script: Built as an ES module library (`chrome-extension/vite.config.mts`)
- Pages: Built as separate HTML entry points with React
- Manifest: Generated from TypeScript (`chrome-extension/manifest.ts`)
- HMR: Custom plugin for hot reloading during development

### Styling
The project uses a mix of styling approaches:
- **Tailwind CSS** - Utility-first CSS framework
- **styled-components** (v5) - For older migrated components
- **Emotion** + **MUI v7** - For newer components (Material-UI with Emotion)

When working with styles:
- Prefer Tailwind for new utility-based styling
- MUI components use Emotion styling
- Legacy components may use styled-components

## Development Notes

### Module Names
When installing dependencies with `pnpm i <package> -F <module>`, use the `name` field from the module's `package.json`. You can omit the `@extension/` prefix (e.g., use `popup` instead of `@extension/popup`).

### Import Paths
- Use `@extension/*` for cross-package imports
- Each module defines its own aliases (e.g., `@src`, `@root`, `@assets`)
- Example: `import { t } from '@extension/i18n'`

### Environment Variables
- Environment variables are managed in the `packages/env/` package
- Variables prefixed with `CEB_*` or `CLI_CEB_*` are globally available
- Use `pnpm set-global-env` to configure environment

### Hot Module Reload (HMR)
- The custom HMR plugin (`packages/hmr/`) enables live reloading during development
- Set `CLI_CEB_DEV=true` to enable HMR (automatically done by `pnpm dev`)
- If HMR freezes, restart the dev server: Ctrl+C then `pnpm dev`

### Browser Compatibility
- Primary target: Chrome/Chromium (Manifest V3)
- Firefox support via `pnpm dev:firefox` and `pnpm build:firefox`
- Firefox-specific manifest adjustments handled automatically
- sidePanel permission removed for Firefox (not supported)

### Testing

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

### TypeScript Code Quality Rules

**IMPORTANT: Never use `any` type (with styled-components v5 exception)**

The use of `any` type is strictly prohibited in this project to maintain type safety:

- **Never use `any` type** in any circumstances
- **Never use `eslint-disable` for `@typescript-eslint/no-explicit-any`**
- **EXCEPTION**: styled-components v5 has incomplete type definitions. The following pattern is ONLY allowed for styled-components:
  ```typescript
  // ✅ EXCEPTION - Only for styled-components v5
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const SButton = (styled as any).button<Props>`...`;
  ```
- Instead, use proper TypeScript types:
  - Use specific interfaces or type definitions
  - Use `unknown` for truly unknown types (then narrow with type guards)
  - Use generic types `<T>` for reusable code
  - Use union types for multiple possible types
  - Use type assertions with specific types when necessary

**Examples:**

```typescript
// ❌ BAD - Never do this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();

// ✅ GOOD - Use proper types
interface Data {
  id: string;
  value: number;
}
const data: Data = getData();

// ✅ GOOD - Use unknown and type guards
const data: unknown = getData();
if (isData(data)) {
  // data is now typed as Data
}

// ✅ GOOD - Use generics
function process<T>(data: T): T {
  return data;
}

// ✅ GOOD - Use specific type assertions
const runtime = chrome.runtime as { lastError?: chrome.runtime.LastError };

// ✅ EXCEPTION - styled-components v5 only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SButton = (styled as any).button<Props>`
  /* styles */
`;
```

### Git Commit Workflow

**IMPORTANT: Always run lint-staged before committing**

Before committing any changes, you **must** run the following command to ensure code quality:

```bash
pnpm dlx lint-staged --allow-empty
```

This command will:
- Run Prettier to format code
- Run ESLint to check and fix linting issues
- Ensure all staged files pass quality checks

**Commit Workflow:**
1. Make your changes
2. Stage files with `git add`
3. **Run `pnpm dlx lint-staged --allow-empty`** ← **REQUIRED**
4. Fix any errors reported by lint-staged
5. Re-stage fixed files if needed
6. Commit with descriptive message

The husky pre-commit hook will also run lint-staged automatically, but running it manually before commit helps catch issues early.

### Working with the Migration
This codebase is actively migrating from Webpack to Vite. The `old/` directory contains the original Webpack-based code for reference. When implementing new features or migrating components:

1. Check `MIGRATION_PLAN.md` for current phase and status
2. Follow the established patterns in already-migrated code (background, popup)
3. Ensure `pnpm build` succeeds after any changes
4. Use `@extension/*` imports consistently for migrated code
