# Architecture

## Monorepo Structure

This project uses **Turborepo** to manage multiple packages and pages. The key directories are:

### `chrome-extension/`
Contains the core Chrome extension configuration:
- `manifest.ts` - Generates the manifest.json file
- `src/background/` - Service worker for the extension
- `src/message/` - Message passing system between different extension contexts
  - `actions.ts` - Message type constants
  - `sender/` - Functions to send messages (background, popup, options, contentScript)
  - `handler/` - Message handlers in the background script
- `public/` - Static assets (icons, CSS)

### `pages/`
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

### `packages/`
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

## Key Design Patterns

### Message Passing System
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

### Storage Architecture
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

### Content Script Injection
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

### i18n (Internationalization)
Uses Chrome Extension i18n API with type-safe TypeScript constants:

- **Languages**: en, ja, ko, de, es, fr, it, zh_CN
- **Usage**:
  ```typescript
  import { t } from '@extension/i18n';
  import { I18N } from '@extension/shared/lib/i18n/keys';

  const message = t(I18N.WELCOME); // Type-safe, IDE autocomplete
  ```
- **Update**: Run `pnpm generate:i18n-keys` after editing `messages.json`
- **Documentation**: See [I18N_GUIDE.md](I18N_GUIDE.md)

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
