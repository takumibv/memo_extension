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
  let id = Math.floor(Math.random() * 1000000);
  while (allIds.has(id)) {
    id = Math.floor(Math.random() * 1000000);
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

export const createNote = async (pageId: number): Promise<NoteCRUDResponseType> => {
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

/**
 * 旧形式 (notes_{pageId}: Note[]) → 新形式 (note_{id}: Note + note_page_index) へマイグレーション
 * background script の起動時に1回だけ呼ぶ
 */
export const migrateStorageIfNeeded = async (): Promise<void> => {
  const migrationCheck = await getStorage(MIGRATION_KEY);
  if (migrationCheck[MIGRATION_KEY]) return;

  console.log('[Storage Migration] Checking for legacy storage format...');

  const allStorage = await getAllStorage();
  const legacyKeys = Object.keys(allStorage).filter(key => key.startsWith(LEGACY_NOTE_PREFIX));

  if (legacyKeys.length === 0) {
    await setStorage(MIGRATION_KEY, true);
    console.log('[Storage Migration] No legacy data found. Skipping.');
    return;
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

    // 旧キーを削除
    await removeStorage(key);
  }

  // インデックスを保存
  await setIndex(newIndex);
  await setStorage(MIGRATION_KEY, true);

  const totalNotes = Object.values(newIndex).flat().length;
  console.log(
    `[Storage Migration] Complete. Migrated ${totalNotes} notes across ${Object.keys(newIndex).length} pages.`,
  );
};
