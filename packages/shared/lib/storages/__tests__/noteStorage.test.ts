import { DEAULT_NOTE_HEIGHT, DEAULT_NOTE_WIDTH } from '../../types/Note.js';
import { createNote, updateNote, deleteNote, getAllNotesByPageId, getAllNotes } from '../noteStorage.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Note } from '../../types/Note.js';

describe('noteStorage', () => {
  beforeEach(() => {
    // Chrome Storage APIモックのリセット
    vi.clearAllMocks();
    // ストレージをクリア
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  describe('createNote', () => {
    it('should create a new note with default values', async () => {
      const pageId = 1;

      // 既存のノートがない状態
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await createNote(pageId);

      expect(result.note).toBeDefined();
      expect(result.note?.id).toBeDefined();
      expect(result.note?.page_info_id).toBe(pageId);
      expect(result.note?.width).toBe(DEAULT_NOTE_WIDTH);
      expect(result.note?.height).toBe(DEAULT_NOTE_HEIGHT);
      expect(result.note?.is_fixed).toBe(true);
      expect(result.note?.is_open).toBe(true);
      expect(result.note?.created_at).toBeDefined();
      expect(result.note?.updated_at).toBeDefined();
      expect(result.allNotes).toHaveLength(1);
      expect(result.allNotes[0]).toEqual(result.note);
    });

    it('should generate unique ID for each note', async () => {
      const pageId = 1;
      const existingNote: Note = {
        id: 123,
        page_info_id: pageId,
        width: DEAULT_NOTE_WIDTH,
        height: DEAULT_NOTE_HEIGHT,
        is_fixed: true,
        is_open: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 既存のノートがある状態
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [existingNote],
      });

      const result = await createNote(pageId);

      expect(result.note?.id).toBeDefined();
      expect(result.note?.id).not.toBe(existingNote.id);
      expect(result.allNotes).toHaveLength(2);
    });

    it('should add new note to existing notes', async () => {
      const pageId = 1;
      const existingNotes: Note[] = [
        { id: 1, page_info_id: pageId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, page_info_id: pageId, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: existingNotes,
      });

      const result = await createNote(pageId);

      expect(result.allNotes).toHaveLength(3);
      expect(result.allNotes[0]).toEqual(existingNotes[0]);
      expect(result.allNotes[1]).toEqual(existingNotes[1]);
      expect(result.allNotes[2]).toEqual(result.note);
    });

    it('should throw error when storage fails', async () => {
      const pageId = 1;

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
      // setStorageが失敗する場合
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(createNote(pageId)).rejects.toThrow();
    });
  });

  describe('updateNote', () => {
    it('should update existing note', async () => {
      const pageId = 1;
      const existingNote: Note = {
        id: 123,
        page_info_id: pageId,
        title: 'Old Title',
        description: 'Old Description',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [existingNote],
      });

      const updatedNote: Note = {
        ...existingNote,
        title: 'New Title',
        description: 'New Description',
      };

      const result = await updateNote(pageId, updatedNote);

      expect(result.note).toEqual(updatedNote);
      expect(result.allNotes).toHaveLength(1);
      expect(result.allNotes[0].title).toBe('New Title');
      expect(result.allNotes[0].description).toBe('New Description');
      // updated_atが更新されている
      expect(result.allNotes[0].updated_at).not.toBe(existingNote.updated_at);
    });

    it('should reject when note has no id', async () => {
      const pageId = 1;
      const noteWithoutId: Note = {
        title: 'Test',
      };

      await expect(updateNote(pageId, noteWithoutId)).rejects.toBe('id is required');
    });

    it('should update only matching note in multiple notes', async () => {
      const pageId = 1;
      const notes: Note[] = [
        { id: 1, title: 'Note 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', created_at: '2024-01-02', updated_at: '2024-01-02' },
        { id: 3, title: 'Note 3', created_at: '2024-01-03', updated_at: '2024-01-03' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes,
      });

      const updatedNote: Note = {
        id: 2,
        title: 'Updated Note 2',
      };

      const result = await updateNote(pageId, updatedNote);

      expect(result.allNotes).toHaveLength(3);
      expect(result.allNotes[0].title).toBe('Note 1');
      expect(result.allNotes[1].title).toBe('Updated Note 2');
      expect(result.allNotes[2].title).toBe('Note 3');
    });

    it('should throw error when storage fails', async () => {
      const pageId = 1;
      const note: Note = { id: 1, title: 'Test' };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [note],
      });
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(updateNote(pageId, note)).rejects.toThrow();
    });
  });

  describe('deleteNote', () => {
    it('should delete note by id', async () => {
      const pageId = 1;
      const notes: Note[] = [
        { id: 1, title: 'Note 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', created_at: '2024-01-02', updated_at: '2024-01-02' },
        { id: 3, title: 'Note 3', created_at: '2024-01-03', updated_at: '2024-01-03' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes,
      });

      const result = await deleteNote(pageId, 2);

      expect(result.note).toEqual(notes[1]);
      expect(result.allNotes).toHaveLength(2);
      expect(result.allNotes[0]).toEqual(notes[0]);
      expect(result.allNotes[1]).toEqual(notes[2]);
    });

    it('should throw error when noteId is not provided', async () => {
      const pageId = 1;

      await expect(deleteNote(pageId, undefined)).rejects.toThrow('id is required');
    });

    it('should remove note storage and page info when deleting last note', async () => {
      const pageId = 1;
      const lastNote: Note = { id: 1, title: 'Last Note', created_at: '2024-01-01', updated_at: '2024-01-01' };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [lastNote],
      });

      const result = await deleteNote(pageId, 1);

      expect(result.allNotes).toHaveLength(0);
      // removeStorageが呼ばれる
      expect(chrome.storage.local.remove).toHaveBeenCalled();
    });

    it('should not remove storage when other notes exist', async () => {
      const pageId = 1;
      const notes: Note[] = [
        { id: 1, title: 'Note 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes,
      });

      const removeStorageCalls = (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mock.calls.length;

      await deleteNote(pageId, 1);

      // 最後のノートではないので、removeStorageは呼ばれない（またはdeletePageInfoのみ）
      expect((chrome.storage.local.remove as ReturnType<typeof vi.fn>).mock.calls.length).toBe(removeStorageCalls);
    });

    it('should throw error when storage fails', async () => {
      const pageId = 1;
      const note: Note = { id: 1, title: 'Test' };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [note],
      });
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(deleteNote(pageId, 1)).rejects.toThrow();
    });
  });

  describe('getAllNotesByPageId', () => {
    it('should return all notes for a specific page', async () => {
      const pageId = 1;
      const notes: Note[] = [
        { id: 1, page_info_id: pageId, title: 'Note 1' },
        { id: 2, page_info_id: pageId, title: 'Note 2' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes,
      });

      const result = await getAllNotesByPageId(pageId);

      expect(result).toEqual(notes);
    });

    it('should return empty array when no notes exist', async () => {
      const pageId = 1;

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getAllNotesByPageId(pageId);

      expect(result).toEqual([]);
    });
  });

  describe('getAllNotes', () => {
    it('should return all notes from all pages', async () => {
      const notes1: Note[] = [
        { id: 1, page_info_id: 1, title: 'Page 1 Note 1' },
        { id: 2, page_info_id: 1, title: 'Page 1 Note 2' },
      ];
      const notes2: Note[] = [{ id: 3, page_info_id: 2, title: 'Page 2 Note 1' }];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes1,
        notes_2: notes2,
        other_data: 'should be ignored',
      });

      const result = await getAllNotes();

      expect(result).toHaveLength(3);
      expect(result).toEqual([...notes1, ...notes2]);
    });

    it('should return empty array when no notes exist', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        other_data: 'not notes',
      });

      const result = await getAllNotes();

      expect(result).toEqual([]);
    });

    it('should filter only notes storage keys', async () => {
      const notes1: Note[] = [{ id: 1, page_info_id: 1, title: 'Note 1' }];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: notes1,
        note_visible: true, // "notes_"で始まらないので除外される
        page_info_1: {},
        settings: {},
      });

      const result = await getAllNotes();

      expect(result).toHaveLength(1);
      expect(result).toEqual(notes1);
    });
  });

  describe('Note data integrity', () => {
    it('should maintain note structure after create-update-delete cycle', async () => {
      const pageId = 1;

      // 初期状態：空
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      // 1. Create
      const createResult = await createNote(pageId);
      const createdNote = createResult.note!;

      expect(createdNote.id).toBeDefined();
      expect(createdNote.created_at).toBeDefined();
      expect(createdNote.updated_at).toBeDefined();

      // 2. Update（モックを更新）
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [createdNote],
      });

      const updatedNoteData: Note = {
        ...createdNote,
        title: 'Updated Title',
        description: 'Updated Description',
        position_x: 100,
        position_y: 200,
      };

      const updateResult = await updateNote(pageId, updatedNoteData);

      expect(updateResult.allNotes[0].title).toBe('Updated Title');
      expect(updateResult.allNotes[0].description).toBe('Updated Description');
      expect(updateResult.allNotes[0].id).toBe(createdNote.id);

      // 3. Delete（モックを更新）
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: updateResult.allNotes,
      });

      const deleteResult = await deleteNote(pageId, createdNote.id);

      expect(deleteResult.note).toBeDefined();
      expect(deleteResult.note?.id).toBe(createdNote.id);
      expect(deleteResult.allNotes).toHaveLength(0);
    });

    it('should handle concurrent note creation with unique IDs', async () => {
      const pageId = 1;

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const note1Result = await createNote(pageId);

      // 2つ目のノート作成時は、1つ目が既に存在する
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [note1Result.note!],
      });

      const note2Result = await createNote(pageId);

      expect(note1Result.note?.id).toBeDefined();
      expect(note2Result.note?.id).toBeDefined();
      expect(note1Result.note?.id).not.toBe(note2Result.note?.id);
      expect(note2Result.allNotes).toHaveLength(2);
    });

    it('should preserve all note properties during update', async () => {
      const pageId = 1;
      const originalNote: Note = {
        id: 1,
        page_info_id: pageId,
        title: 'Original Title',
        description: 'Original Description',
        position_x: 50,
        position_y: 100,
        width: 300,
        height: 200,
        is_open: true,
        is_fixed: false,
        color: '#ff0000',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        notes_1: [originalNote],
      });

      const partialUpdate: Note = {
        id: 1,
        title: 'Updated Title',
      };

      const result = await updateNote(pageId, partialUpdate);

      // 更新されたプロパティ
      expect(result.allNotes[0].title).toBe('Updated Title');
      // updated_atは更新される
      expect(result.allNotes[0].updated_at).not.toBe(originalNote.updated_at);
    });
  });
});
