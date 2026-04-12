import { getStorage, setStorage, removeStorage, getAllStorage } from './common';
import { deletePageInfo } from './pageInfoStorage';
import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH } from '@/shared/types/Note';
import type { Note } from '@/shared/types/Note';

// ===== ストレージキー =====
const NOTE_KEY_PREFIX = 'note_';
const INDEX_KEY = 'note_page_index';
const MIGRATION_KEY = 'note_storage_v2_migrated';

// 旧形式のキープレフィックス（マイグレーション用）
const LEGACY_NOTE_PREFIX = 'notes_';

const noteKey = (id: number) => `${NOTE_KEY_PREFIX}${id}`;

// ===== インデックス操作 =====

type NotePageIndex = Record<string, number[]>;

const getIndex = async (): Promise<NotePageIndex> => {
  const storage = await getStorage(INDEX_KEY);
  return (storage[INDEX_KEY] || {}) as NotePageIndex;
};

const setIndex = async (index: NotePageIndex): Promise<boolean> => setStorage(INDEX_KEY, index);

const addToIndex = async (pageId: number, noteId: number): Promise<void> => {
  const index = await getIndex();
  const pageKey = String(pageId);
  const ids = index[pageKey] || [];
  if (!ids.includes(noteId)) {
    index[pageKey] = [...ids, noteId];
    await setIndex(index);
  }
};

const removeFromIndex = async (pageId: number, noteId: number): Promise<void> => {
  const index = await getIndex();
  const pageKey = String(pageId);
  const ids = (index[pageKey] || []).filter(id => id !== noteId);

  if (ids.length === 0) {
    delete index[pageKey];
  } else {
    index[pageKey] = ids;
  }
  await setIndex(index);
};

const removePageFromIndex = async (pageId: number): Promise<void> => {
  const index = await getIndex();
  delete index[String(pageId)];
  await setIndex(index);
};

// ===== ID生成 =====

const generateId = async (): Promise<number> => {
  const index = await getIndex();
  const allIds = new Set(Object.values(index).flat());
  let id = Math.floor(Math.random() * 999999) + 1;
  while (allIds.has(id)) {
    id = Math.floor(Math.random() * 999999) + 1;
  }
  return id;
};

// ===== 個別ノート操作 =====

const getNote = async (id: number): Promise<Note | undefined> => {
  const key = noteKey(id);
  const storage = await getStorage(key);
  return storage[key] as Note | undefined;
};

const setNote = async (note: Note): Promise<boolean> => {
  if (!note.id) throw new Error('note.id is required');
  return setStorage(noteKey(note.id), note);
};

const removeNote = async (id: number): Promise<boolean> => removeStorage(noteKey(id));

// ===== 公開API =====

export type NoteCRUDResponseType = { note?: Note; allNotes: Note[] };

export const createNote = async (
  pageId: number,
  overrides?: Partial<Omit<Note, 'id' | 'page_info_id' | 'created_at' | 'updated_at'>>,
): Promise<NoteCRUDResponseType> => {
  const id = await generateId();
  const newNote: Note = {
    id,
    page_info_id: pageId,
    width: DEAULT_NOTE_WIDTH,
    height: DEAULT_NOTE_HEIGHT,
    is_fixed: true,
    is_open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };

  await setNote(newNote);
  await addToIndex(pageId, id);

  const allNotes = await getAllNotesByPageId(pageId);
  return { note: newNote, allNotes };
};

export const updateNote = async (pageId: number, note: Note): Promise<NoteCRUDResponseType> => {
  if (!note.id) throw new Error('id is required');

  const updatedNote = { ...note, updated_at: new Date().toISOString() };
  await setNote(updatedNote);

  const allNotes = await getAllNotesByPageId(pageId);
  return { note: updatedNote, allNotes };
};

export const getAllNotesByPageId = async (pageId: number): Promise<Note[]> => {
  const index = await getIndex();
  const ids = index[String(pageId)] || [];

  if (ids.length === 0) return [];

  const notes = await Promise.all(ids.map(id => getNote(id)));
  return notes.filter((n): n is Note => n != null);
};

export const getAllNotes = async (): Promise<Note[]> => {
  const index = await getIndex();
  const allIds = Object.values(index).flat();

  if (allIds.length === 0) return [];

  const notes = await Promise.all(allIds.map(id => getNote(id)));
  return notes.filter((n): n is Note => n != null);
};

export const deleteNote = async (pageId: number, noteId?: number): Promise<NoteCRUDResponseType> => {
  if (!noteId) throw new Error('id is required');

  const note = await getNote(noteId);
  await removeNote(noteId);
  await removeFromIndex(pageId, noteId);

  const allNotes = await getAllNotesByPageId(pageId);

  if (allNotes.length === 0) {
    await deletePageInfo(pageId);
    await removePageFromIndex(pageId);
  }

  return { note, allNotes };
};

// ===== マイグレーション =====

const MIGRATION_MAX_RETRIES = 3;
const MIGRATION_BASE_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * 移行結果を返す型（アナリティクス連携用）
 */
export type MigrationResult =
  | { status: 'already_done' }
  | { status: 'no_legacy_data' }
  | { status: 'success'; noteCount: number; pageCount: number }
  | { status: 'retry_success'; attempt: number; noteCount: number; pageCount: number }
  | { status: 'error'; error: string; attempts: number };

/**
 * マイグレーション本体（リトライなし）
 */
const executeMigration = async (): Promise<MigrationResult> => {
  const migrationCheck = await getStorage(MIGRATION_KEY);
  if (migrationCheck[MIGRATION_KEY]) return { status: 'already_done' };

  console.log('[Storage Migration] Checking for legacy storage format...');

  const allStorage = await getAllStorage();
  const legacyKeys = Object.keys(allStorage).filter(key => key.startsWith(LEGACY_NOTE_PREFIX));

  if (legacyKeys.length === 0) {
    await setStorage(MIGRATION_KEY, true);
    console.log('[Storage Migration] No legacy data found. Skipping.');
    return { status: 'no_legacy_data' };
  }

  console.log(`[Storage Migration] Found ${legacyKeys.length} legacy page(s). Migrating...`);

  const newIndex: NotePageIndex = {};

  for (const key of legacyKeys) {
    const pageIdStr = key.replace(LEGACY_NOTE_PREFIX, '');
    const pageId = Number(pageIdStr);
    if (isNaN(pageId)) continue;

    const legacyNotes = allStorage[key] as Note[];
    if (!Array.isArray(legacyNotes)) continue;

    const noteIds: number[] = [];

    for (const note of legacyNotes) {
      if (!note.id) continue;

      // 個別ノートとして保存
      await setStorage(noteKey(note.id), note);
      noteIds.push(note.id);
    }

    if (noteIds.length > 0) {
      newIndex[String(pageId)] = noteIds;
    }

    // Phase 1: 旧キーは削除しない（ロールバック安全性のため）
    // Phase 2（将来バージョン）で旧キーをクリーンアップする
  }

  // インデックスを保存
  await setIndex(newIndex);
  await setStorage(MIGRATION_KEY, true);

  const totalNotes = Object.values(newIndex).flat().length;
  const pageCount = Object.keys(newIndex).length;
  console.log(`[Storage Migration] Complete. Migrated ${totalNotes} notes across ${pageCount} pages.`);

  return { status: 'success', noteCount: totalNotes, pageCount };
};

/**
 * 旧形式 (notes_{pageId}: Note[]) → 新形式 (note_{id}: Note + note_page_index) へマイグレーション
 * background script の起動時に1回だけ呼ぶ
 *
 * Phase 1 安全戦略:
 * - 旧データは削除しない（Copy, not Move）
 * - 新形式への書き込みのみ行う
 * - 万が一バグがあれば旧バージョンに戻せばデータは無傷
 *
 * LevelDB ロック競合（LOCK: File currently in use）対策として
 * 指数バックオフによるリトライを行う（最大3回）
 */
export const migrateStorageIfNeeded = async (): Promise<MigrationResult> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MIGRATION_MAX_RETRIES; attempt++) {
    try {
      const result = await executeMigration();

      if (attempt > 1 && (result.status === 'success' || result.status === 'already_done')) {
        const noteCount = result.status === 'success' ? result.noteCount : 0;
        const pageCount = result.status === 'success' ? result.pageCount : 0;
        console.log(`[Storage Migration] Succeeded on retry attempt ${attempt}`);
        return { status: 'retry_success', attempt, noteCount, pageCount };
      }

      return result;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[Storage Migration] Attempt ${attempt}/${MIGRATION_MAX_RETRIES} failed: ${message}`);

      if (attempt < MIGRATION_MAX_RETRIES) {
        const delay = MIGRATION_BASE_DELAY_MS * 2 ** (attempt - 1);
        console.log(`[Storage Migration] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  return { status: 'error', error: message, attempts: MIGRATION_MAX_RETRIES };
};
