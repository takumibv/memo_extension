# Review Prompt Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a review/donation prompt modal in the Options page when the user has 10+ notes, with snooze/dismiss handling and centralized URL management.

**Architecture:** Add a `reviewPromptStorage` module that persists `{ status, snoozedUntil }`. App.tsx checks `shouldShowReviewPrompt(noteCount)` after data loads and mounts a `<ReviewPromptModal>` (Radix Dialog) on a 1.5s delay. The modal handles button clicks (open external URL + auto-check the "don't show again" box, ephemeral thanks message) and writes to storage only on close. URLs (Buy Me a Coffee, Twitter, Chrome Web Store reviews) are extracted into `shared/constants/links.ts` and `shared/utils/chromeWebStore.ts`; the existing hard-coded URLs in `SettingsPage.tsx` are migrated to use these.

**Tech Stack:** React 19, TypeScript, @radix-ui/react-dialog, lucide-react, Tailwind, Vitest, chrome.storage.local, chrome.i18n

**Spec:** `docs/superpowers/specs/2026-04-30-review-prompt-modal-design.md`

**Branch:** `feature/review-prompt-modal` (already created)

**Conventions:**
- Use `chrome.i18n.getMessage(key)` via `t(key)` from `@/shared/i18n/i18n`. Add new message strings to `src/public/_locales/{ja,en}/messages.json`. Other locales (`de`, `es`, `fr`, `it`, `ko`, `zh_CN`) get the English text as a fallback.
- Storage helpers via `getStorage`, `setStorage`, `removeStorage` from `@/shared/storages/common`.
- Tests use the inline mock pattern from `src/shared/storages/__tests__/noteStorage.test.ts` (mockStorage Record + mocked chrome.storage.local).
- TypeScript: never use `any`.
- Commit on each task. Always run `pnpm dlx lint-staged --allow-empty` before committing.

---

## File Structure

### Create

| Path                                                              | Responsibility                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/shared/constants/links.ts`                                   | Static external URL constants                                               |
| `src/shared/utils/chromeWebStore.ts`                              | `getChromeWebStoreReviewUrl()` (dynamic from `chrome.runtime.id`)            |
| `src/shared/storages/reviewPromptStorage.ts`                      | State persistence + `shouldShowReviewPrompt(noteCount)`                     |
| `src/shared/storages/__tests__/reviewPromptStorage.test.ts`       | Vitest tests for storage logic                                              |
| `src/options/components/ReviewPromptModal.tsx`                    | Modal UI (Radix Dialog)                                                     |

### Modify

| Path                                                       | Change                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/entrypoints/options/App.tsx`                         | Add show-detection effect + mount `<ReviewPromptModal>`                         |
| `src/options/components/SettingsPage.tsx`                 | Replace hard-coded `https://buymeacoffee.com/takumibv` and `https://x.com/takumi_bv` with `EXTERNAL_LINKS` references |
| `src/public/_locales/ja/messages.json`                    | Add 8 new keys (Japanese)                                                       |
| `src/public/_locales/en/messages.json`                    | Add 8 new keys (English)                                                        |
| `src/public/_locales/{de,es,fr,it,ko,zh_CN}/messages.json` | Add 8 new keys (English fallback values)                                        |

---

## Task 1: Add external links constants and Chrome Web Store helper

**Files:**
- Create: `src/shared/constants/links.ts`
- Create: `src/shared/utils/chromeWebStore.ts`

- [ ] **Step 1: Create the constants file**

Create `src/shared/constants/links.ts`:

```ts
export const EXTERNAL_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com/takumibv',
  twitter: 'https://x.com/takumi_bv',
} as const;
```

- [ ] **Step 2: Create the Chrome Web Store helper**

Create `src/shared/utils/chromeWebStore.ts`:

```ts
export const getChromeWebStoreReviewUrl = (): string =>
  `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
```

- [ ] **Step 3: Type-check**

Run: `pnpm type-check`
Expected: pass with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/constants/links.ts src/shared/utils/chromeWebStore.ts
pnpm dlx lint-staged --allow-empty
git commit -m "feat: add external links constants and Chrome Web Store URL helper"
```

---

## Task 2: Migrate hard-coded URLs in SettingsPage to constants

**Files:**
- Modify: `src/options/components/SettingsPage.tsx` (line 7 imports, line 341 buymeacoffee, line 356 twitter)

- [ ] **Step 1: Add import for EXTERNAL_LINKS**

In `src/options/components/SettingsPage.tsx`, add an import after the existing imports (around line 10):

```ts
import { EXTERNAL_LINKS } from '@/shared/constants/links';
```

- [ ] **Step 2: Replace the buymeacoffee href**

In `src/options/components/SettingsPage.tsx` around line 341, replace:

```tsx
href="https://buymeacoffee.com/takumibv"
```

with:

```tsx
href={EXTERNAL_LINKS.buyMeACoffee}
```

- [ ] **Step 3: Replace the twitter href**

In `src/options/components/SettingsPage.tsx` around line 356, replace:

```tsx
href="https://x.com/takumi_bv"
```

with:

```tsx
href={EXTERNAL_LINKS.twitter}
```

- [ ] **Step 4: Type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/options/components/SettingsPage.tsx
pnpm dlx lint-staged --allow-empty
git commit -m "refactor: replace hard-coded URLs in SettingsPage with EXTERNAL_LINKS"
```

---

## Task 3: Write failing tests for reviewPromptStorage

**Files:**
- Create: `src/shared/storages/__tests__/reviewPromptStorage.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/shared/storages/__tests__/reviewPromptStorage.test.ts`:

```ts
import {
  getReviewPromptState,
  markDismissed,
  markSnoozed,
  shouldShowReviewPrompt,
  SNOOZE_DURATION_DAYS,
} from '../reviewPromptStorage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mockStorage: Record<string, unknown> = {};

const setupMockStorage = () => {
  mockStorage = {};

  (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation((key: string | null) => {
    if (key === null) return Promise.resolve({ ...mockStorage });
    return Promise.resolve({ [key]: mockStorage[key] });
  });

  (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockImplementation((items: Record<string, unknown>) => {
    Object.assign(mockStorage, items);
    return Promise.resolve();
  });

  (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  });

  delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
};

describe('reviewPromptStorage', () => {
  beforeEach(() => {
    setupMockStorage();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getReviewPromptState', () => {
    it('未保存のときは undefined を返す', async () => {
      const state = await getReviewPromptState();
      expect(state).toBeUndefined();
    });
  });

  describe('markDismissed', () => {
    it('status: dismissed を保存する', async () => {
      await markDismissed();
      const state = await getReviewPromptState();
      expect(state).toEqual({ status: 'dismissed' });
    });
  });

  describe('markSnoozed', () => {
    it('status: snoozed と snoozedUntil (7日後) を保存する', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      const state = await getReviewPromptState();
      const expected = new Date('2026-05-07T00:00:00Z').toISOString();
      expect(state).toEqual({ status: 'snoozed', snoozedUntil: expected });
    });
  });

  describe('shouldShowReviewPrompt', () => {
    it('noteCount < 10 のとき false を返す', async () => {
      expect(await shouldShowReviewPrompt(0)).toBe(false);
      expect(await shouldShowReviewPrompt(9)).toBe(false);
    });

    it('未保存 + noteCount >= 10 のとき true を返す', async () => {
      expect(await shouldShowReviewPrompt(10)).toBe(true);
      expect(await shouldShowReviewPrompt(50)).toBe(true);
    });

    it('dismissed なら noteCount に関わらず false', async () => {
      await markDismissed();
      expect(await shouldShowReviewPrompt(100)).toBe(false);
    });

    it('snoozed で期限内なら false', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      // 6日後（期限内）
      vi.setSystemTime(new Date('2026-05-06T00:00:00Z'));
      expect(await shouldShowReviewPrompt(20)).toBe(false);
    });

    it('snoozed で期限切れなら true', async () => {
      await markSnoozed(SNOOZE_DURATION_DAYS);
      // 8日後（期限切れ）
      vi.setSystemTime(new Date('2026-05-08T00:00:00Z'));
      expect(await shouldShowReviewPrompt(20)).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/shared/storages/__tests__/reviewPromptStorage.test.ts`
Expected: FAIL — `Cannot find module '../reviewPromptStorage'` or similar.

- [ ] **Step 3: Commit (failing tests)**

```bash
git add src/shared/storages/__tests__/reviewPromptStorage.test.ts
pnpm dlx lint-staged --allow-empty
git commit -m "test: add failing tests for reviewPromptStorage"
```

---

## Task 4: Implement reviewPromptStorage

**Files:**
- Create: `src/shared/storages/reviewPromptStorage.ts`

- [ ] **Step 1: Implement the storage module**

Create `src/shared/storages/reviewPromptStorage.ts`:

```ts
import { getStorage, setStorage } from './common';

const REVIEW_PROMPT_KEY = 'review_prompt_state';

export const SNOOZE_DURATION_DAYS = 7;
const NOTE_COUNT_THRESHOLD = 10;

export type ReviewPromptStatus = 'snoozed' | 'dismissed';

export type ReviewPromptState = {
  status: ReviewPromptStatus;
  snoozedUntil?: string;
};

export const getReviewPromptState = async (): Promise<ReviewPromptState | undefined> => {
  const storage = await getStorage(REVIEW_PROMPT_KEY);
  return storage[REVIEW_PROMPT_KEY] as ReviewPromptState | undefined;
};

export const markDismissed = async (): Promise<void> => {
  const state: ReviewPromptState = { status: 'dismissed' };
  await setStorage(REVIEW_PROMPT_KEY, state);
};

export const markSnoozed = async (durationDays: number): Promise<void> => {
  const snoozedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const state: ReviewPromptState = { status: 'snoozed', snoozedUntil };
  await setStorage(REVIEW_PROMPT_KEY, state);
};

export const shouldShowReviewPrompt = async (noteCount: number): Promise<boolean> => {
  if (noteCount < NOTE_COUNT_THRESHOLD) return false;

  const state = await getReviewPromptState();
  if (!state) return true;

  if (state.status === 'dismissed') return false;

  if (state.status === 'snoozed') {
    if (!state.snoozedUntil) return true;
    return new Date(state.snoozedUntil).getTime() <= Date.now();
  }

  return false;
};
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm test src/shared/storages/__tests__/reviewPromptStorage.test.ts`
Expected: all 8 tests PASS.

- [ ] **Step 3: Type-check**

Run: `pnpm type-check`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/shared/storages/reviewPromptStorage.ts
pnpm dlx lint-staged --allow-empty
git commit -m "feat: add reviewPromptStorage with snooze/dismiss state"
```

---

## Task 5: Add i18n keys for ja and en

**Files:**
- Modify: `src/public/_locales/ja/messages.json`
- Modify: `src/public/_locales/en/messages.json`

- [ ] **Step 1: Add Japanese keys**

Append to `src/public/_locales/ja/messages.json` (before the closing `}`, after the last existing key — add a comma to the previous last key if needed):

```json
  "review_prompt_title": {
    "message": "拡張機能はいかがですか？"
  },
  "review_prompt_description": {
    "message": "いつもご利用いただきありがとうございます。よろしければストアでのレビューや、開発者へのご支援をいただけると励みになります 🙏"
  },
  "review_prompt_button_review": {
    "message": "⭐ ストアでレビューする"
  },
  "review_prompt_button_coffee": {
    "message": "☕ コーヒーを奢る"
  },
  "review_prompt_button_later": {
    "message": "あとでにする"
  },
  "review_prompt_dont_show_again": {
    "message": "次回から表示しない"
  },
  "review_prompt_thanks_review": {
    "message": "レビューありがとうございます！🙏"
  },
  "review_prompt_thanks_coffee": {
    "message": "コーヒーをありがとうございます！☕💛"
  }
```

- [ ] **Step 2: Add English keys**

Append the same keys to `src/public/_locales/en/messages.json` with English values:

```json
  "review_prompt_title": {
    "message": "How are you enjoying the extension?"
  },
  "review_prompt_description": {
    "message": "Thanks for using the extension! A review or a small donation would mean a lot. 🙏"
  },
  "review_prompt_button_review": {
    "message": "⭐ Leave a review"
  },
  "review_prompt_button_coffee": {
    "message": "☕ Buy me a coffee"
  },
  "review_prompt_button_later": {
    "message": "Maybe later"
  },
  "review_prompt_dont_show_again": {
    "message": "Don't show again"
  },
  "review_prompt_thanks_review": {
    "message": "Thanks for the review! 🙏"
  },
  "review_prompt_thanks_coffee": {
    "message": "Thanks for the coffee! ☕💛"
  }
```

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/public/_locales/ja/messages.json'))" && node -e "JSON.parse(require('fs').readFileSync('src/public/_locales/en/messages.json'))"`
Expected: no output (both files valid JSON).

- [ ] **Step 4: Commit**

```bash
git add src/public/_locales/ja/messages.json src/public/_locales/en/messages.json
pnpm dlx lint-staged --allow-empty
git commit -m "i18n: add review prompt messages (ja, en)"
```

---

## Task 6: Add i18n keys for other locales (English fallback)

**Files:**
- Modify: `src/public/_locales/{de,es,fr,it,ko,zh_CN}/messages.json`

- [ ] **Step 1: Append English-fallback keys to all 6 locales**

For each of the 6 locale files (`de`, `es`, `fr`, `it`, `ko`, `zh_CN`), append the same 8 keys with English values (identical to the en/messages.json values added in Task 5):

```json
  "review_prompt_title": {
    "message": "How are you enjoying the extension?"
  },
  "review_prompt_description": {
    "message": "Thanks for using the extension! A review or a small donation would mean a lot. 🙏"
  },
  "review_prompt_button_review": {
    "message": "⭐ Leave a review"
  },
  "review_prompt_button_coffee": {
    "message": "☕ Buy me a coffee"
  },
  "review_prompt_button_later": {
    "message": "Maybe later"
  },
  "review_prompt_dont_show_again": {
    "message": "Don't show again"
  },
  "review_prompt_thanks_review": {
    "message": "Thanks for the review! 🙏"
  },
  "review_prompt_thanks_coffee": {
    "message": "Thanks for the coffee! ☕💛"
  }
```

- [ ] **Step 2: Validate all JSON files**

Run:
```bash
for L in de es fr it ko zh_CN; do
  node -e "JSON.parse(require('fs').readFileSync('src/public/_locales/$L/messages.json'))" && echo "$L OK" || echo "$L INVALID";
done
```
Expected: all 6 locales print `OK`.

- [ ] **Step 3: Commit**

```bash
git add src/public/_locales/de/messages.json src/public/_locales/es/messages.json src/public/_locales/fr/messages.json src/public/_locales/it/messages.json src/public/_locales/ko/messages.json src/public/_locales/zh_CN/messages.json
pnpm dlx lint-staged --allow-empty
git commit -m "i18n: add review prompt messages to remaining locales (English fallback)"
```

---

## Task 7: Implement ReviewPromptModal component

**Files:**
- Create: `src/options/components/ReviewPromptModal.tsx`

- [ ] **Step 1: Create the component**

Create `src/options/components/ReviewPromptModal.tsx`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/Dialog';
import { EXTERNAL_LINKS } from '@/shared/constants/links';
import { t } from '@/shared/i18n/i18n';
import { markDismissed, markSnoozed, SNOOZE_DURATION_DAYS } from '@/shared/storages/reviewPromptStorage';
import { getChromeWebStoreReviewUrl } from '@/shared/utils/chromeWebStore';
import { Star, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ReviewPromptModal = ({ open, onOpenChange }: Props) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [reviewedThisSession, setReviewedThisSession] = useState(false);
  const [donatedThisSession, setDonatedThisSession] = useState(false);

  const handleReview = () => {
    window.open(getChromeWebStoreReviewUrl(), '_blank', 'noopener,noreferrer');
    setReviewedThisSession(true);
    setDontShowAgain(true);
  };

  const handleCoffee = () => {
    window.open(EXTERNAL_LINKS.buyMeACoffee, '_blank', 'noopener,noreferrer');
    setDonatedThisSession(true);
    setDontShowAgain(true);
  };

  const handleClose = async () => {
    try {
      if (dontShowAgain) {
        await markDismissed();
      } else {
        await markSnoozed(SNOOZE_DURATION_DAYS);
      }
    } catch (err) {
      console.error('[ReviewPromptModal] Failed to persist state:', err);
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) {
          void handleClose();
        } else {
          onOpenChange(true);
        }
      }}>
      <DialogContent className="max-w-sm bg-white p-6">
        <button
          type="button"
          onClick={() => void handleClose()}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
          <Star className="h-5 w-5 text-indigo-600" />
        </div>

        <DialogTitle className="mb-2 text-base font-semibold text-gray-900">
          {t('review_prompt_title')}
        </DialogTitle>
        <DialogDescription className="mb-4 text-sm leading-relaxed text-gray-500">
          {t('review_prompt_description')}
        </DialogDescription>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleReview}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            {t('review_prompt_button_review')}
          </button>
          {reviewedThisSession && (
            <p className="text-xs text-gray-500">{t('review_prompt_thanks_review')}</p>
          )}

          <button
            type="button"
            onClick={handleCoffee}
            className="w-full rounded-md bg-[#FFDD00] px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-[#FFCA00]">
            {t('review_prompt_button_coffee')}
          </button>
          {donatedThisSession && (
            <p className="text-xs text-gray-500">{t('review_prompt_thanks_coffee')}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-indigo-600"
            />
            {t('review_prompt_dont_show_again')}
          </label>
          <button
            type="button"
            onClick={() => void handleClose()}
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50">
            {t('review_prompt_button_later')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPromptModal;
```

- [ ] **Step 2: Type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/options/components/ReviewPromptModal.tsx
pnpm dlx lint-staged --allow-empty
git commit -m "feat: add ReviewPromptModal component"
```

---

## Task 8: Wire modal into Options App

**Files:**
- Modify: `src/entrypoints/options/App.tsx`

- [ ] **Step 1: Add imports**

In `src/entrypoints/options/App.tsx`, add these imports next to the existing imports:

```ts
import ReviewPromptModal from '@/options/components/ReviewPromptModal';
import { shouldShowReviewPrompt } from '@/shared/storages/reviewPromptStorage';
```

- [ ] **Step 2: Add state and effect**

Inside the `Options` component, after the existing `useState` declarations (around line 27 after `const [isLoading, setIsLoading] = useState(true);`), add:

```ts
const [showReviewPrompt, setShowReviewPrompt] = useState(false);
```

Then, after the existing data-loading `useEffect` (around line 41), add a new effect:

```ts
useEffect(() => {
  if (isLoading) return;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  shouldShowReviewPrompt(notes.length).then(should => {
    if (should) {
      timeoutId = setTimeout(() => setShowReviewPrompt(true), 1500);
    }
  });
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [isLoading, notes.length]);
```

- [ ] **Step 3: Mount the modal in JSX**

In the JSX returned from `Options`, just before the closing `</div>` of the root element (the one closing `<div className="min-h-screen bg-gray-50">`), add:

```tsx
<ReviewPromptModal open={showReviewPrompt} onOpenChange={setShowReviewPrompt} />
```

The final JSX should look like:

```tsx
return (
  <div className="min-h-screen bg-gray-50">
    <OptionsHeader ... />
    {tab === 'memos' ? (
      <MemoListPage ... />
    ) : (
      <SettingsPage ... />
    )}
    <ReviewPromptModal open={showReviewPrompt} onOpenChange={setShowReviewPrompt} />
  </div>
);
```

- [ ] **Step 4: Type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Run all tests**

Run: `pnpm test`
Expected: all tests pass (existing + new reviewPromptStorage tests).

- [ ] **Step 6: Commit**

```bash
git add src/entrypoints/options/App.tsx
pnpm dlx lint-staged --allow-empty
git commit -m "feat: show review prompt modal in Options when notes >= 10"
```

---

## Task 9: Build verification

**Files:** none (verification only)

- [ ] **Step 1: Production build (Chrome)**

Run: `pnpm build`
Expected: build succeeds with no errors.

- [ ] **Step 2: Production build (Firefox)**

Run: `pnpm build:firefox`
Expected: build succeeds with no errors.

- [ ] **Step 3: Re-run all checks**

Run: `pnpm type-check && pnpm lint && pnpm test`
Expected: all green.

- [ ] **Step 4: Manual verification (skip if cannot run extension)**

If able to load the unpacked extension in Chrome:
1. Clear `chrome.storage.local` (or test with a fresh profile)
2. Create at least 10 notes via the content script
3. Open the Options page
4. Verify modal appears ~1.5s after load
5. Click "コーヒーを奢る" → new tab opens, checkbox auto-checks, thanks message shows
6. Uncheck "次回から表示しない", click "あとでにする" → modal closes
7. Re-open Options → modal does **not** appear (snoozed until 7 days from now)
8. In DevTools, manually edit storage to set `snoozedUntil` to a past date → reload → modal appears again
9. Check the box, click "あとでにする" → reload → modal does **not** appear (dismissed)

If manual testing isn't possible in this session, note that and proceed.

- [ ] **Step 5: No commit needed (verification task)**

---

## Coverage Summary (self-review)

| Spec section                              | Covered by                          |
| ----------------------------------------- | ----------------------------------- |
| 表示判定 (`shouldShowReviewPrompt`)        | Task 3 tests, Task 4 implementation |
| データモデル                               | Task 4                              |
| ボタン挙動：レビュー / コーヒー            | Task 7 (`handleReview`, `handleCoffee`) |
| ボタン挙動：閉じる                         | Task 7 (`handleClose`)              |
| dontShowAgain チェックボックスのロジック   | Task 7                              |
| ファイル構成（新規 4 ファイル）             | Tasks 1, 4, 7                       |
| ファイル構成（変更 3 ファイル）             | Tasks 2, 5/6, 8                     |
| URL 一元管理（ハイブリッド方式）            | Tasks 1, 2                          |
| i18n キー (8 個)                          | Tasks 5, 6                          |
| UI 仕様（縦並び、フッター）                 | Task 7                              |
| 状態管理（コンポーネント内）                | Task 7                              |
| エラーハンドリング (markDismissed/Snoozed) | Task 7 (try/catch in `handleClose`) |
| テスト                                    | Task 3                              |
| 1.5s 表示遅延                              | Task 8                              |
