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
