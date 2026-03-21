import {
  createNote,
  updateNote,
  deleteNote,
  getAllNotesByPageId,
  getAllNotes,
  migrateStorageIfNeeded,
} from '../noteStorage';
import { DEAULT_NOTE_WIDTH, DEAULT_NOTE_HEIGHT } from '@/shared/types/Note';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Note } from '@/shared/types/Note';

// ストレージのインメモリシミュレーション
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

// deletePageInfo のモック
vi.mock('../pageInfoStorage', () => ({
  deletePageInfo: vi.fn().mockResolvedValue({ allPageInfos: [] }),
}));

describe('noteStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  describe('createNote', () => {
    it('新しいノートを作成しデフォルト値が設定される', async () => {
      const result = await createNote(1);

      expect(result.note).toBeDefined();
      expect(result.note!.page_info_id).toBe(1);
      expect(result.note!.width).toBe(DEAULT_NOTE_WIDTH);
      expect(result.note!.height).toBe(DEAULT_NOTE_HEIGHT);
      expect(result.note!.is_fixed).toBe(true);
      expect(result.note!.is_open).toBe(true);
      expect(result.note!.created_at).toBeDefined();
      expect(result.note!.updated_at).toBeDefined();
    });

    it('ユニークなIDが生成される', async () => {
      const result1 = await createNote(1);
      const result2 = await createNote(1);

      expect(result1.note!.id).not.toBe(result2.note!.id);
    });

    it('allNotesに作成したノートが含まれる', async () => {
      const result = await createNote(1);

      expect(result.allNotes).toHaveLength(1);
      expect(result.allNotes[0]!.id).toBe(result.note!.id);
    });

    it('同じページに複数ノートを作成できる', async () => {
      await createNote(1);
      await createNote(1);
      const result = await createNote(1);

      expect(result.allNotes).toHaveLength(3);
    });

    it('異なるページにノートを作成できる', async () => {
      await createNote(1);
      await createNote(2);

      const page1Notes = await getAllNotesByPageId(1);
      const page2Notes = await getAllNotesByPageId(2);

      expect(page1Notes).toHaveLength(1);
      expect(page2Notes).toHaveLength(1);
    });
  });

  describe('updateNote', () => {
    it('ノートのフィールドを更新できる', async () => {
      const { note } = await createNote(1);
      const updated: Note = { ...note!, title: 'Updated Title', description: 'New description' };

      const result = await updateNote(1, updated);

      expect(result.note!.title).toBe('Updated Title');
      expect(result.note!.description).toBe('New description');
    });

    it('updated_atが更新される', async () => {
      const { note } = await createNote(1);
      const originalUpdatedAt = note!.updated_at;

      // 時間差を確保
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await updateNote(1, note!);

      expect(result.note!.updated_at).not.toBe(originalUpdatedAt);
    });

    it('idがないノートはエラーになる', async () => {
      const noteWithoutId: Note = { title: 'No ID' };

      await expect(updateNote(1, noteWithoutId)).rejects.toThrow('id is required');
    });
  });

  describe('deleteNote', () => {
    it('ノートを削除できる', async () => {
      const { note: note1 } = await createNote(1);
      await createNote(1);

      const result = await deleteNote(1, note1!.id);

      expect(result.allNotes).toHaveLength(1);
      expect(result.note!.id).toBe(note1!.id);
    });

    it('最後のノート削除時にdeletePageInfoが呼ばれる', async () => {
      const { deletePageInfo } = await import('../pageInfoStorage');
      const { note } = await createNote(1);

      await deleteNote(1, note!.id);

      expect(deletePageInfo).toHaveBeenCalledWith(1);
    });

    it('noteIdがundefinedの場合エラーになる', async () => {
      await expect(deleteNote(1, undefined)).rejects.toThrow('id is required');
    });
  });

  describe('getAllNotesByPageId', () => {
    it('指定ページのノートを全て取得する', async () => {
      await createNote(1);
      await createNote(1);
      await createNote(2);

      const notes = await getAllNotesByPageId(1);

      expect(notes).toHaveLength(2);
      notes.forEach(note => {
        expect(note.page_info_id).toBe(1);
      });
    });

    it('ノートがないページでは空配列を返す', async () => {
      const notes = await getAllNotesByPageId(999);

      expect(notes).toEqual([]);
    });
  });

  describe('getAllNotes', () => {
    it('全ページのノートを取得する', async () => {
      await createNote(1);
      await createNote(1);
      await createNote(2);

      const notes = await getAllNotes();

      expect(notes).toHaveLength(3);
    });

    it('ノートがない場合は空配列を返す', async () => {
      const notes = await getAllNotes();

      expect(notes).toEqual([]);
    });
  });

  describe('migrateStorageIfNeeded', () => {
    it('マイグレーション済みの場合はスキップする', async () => {
      mockStorage['note_storage_v2_migrated'] = true;

      await migrateStorageIfNeeded();

      // set が呼ばれるのはマイグレーションフラグの読み取りのみ
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });

    it('旧形式データがない場合はフラグだけ設定する', async () => {
      await migrateStorageIfNeeded();

      expect(mockStorage['note_storage_v2_migrated']).toBe(true);
    });

    it('旧形式データを新形式にマイグレーションする', async () => {
      const legacyNotes: Note[] = [
        { id: 100, page_info_id: 1, title: 'Legacy Note 1' },
        { id: 200, page_info_id: 1, title: 'Legacy Note 2' },
      ];
      mockStorage['notes_1'] = legacyNotes;

      await migrateStorageIfNeeded();

      // 個別ノートキーで保存されている
      expect(mockStorage['note_100']).toEqual(legacyNotes[0]);
      expect(mockStorage['note_200']).toEqual(legacyNotes[1]);

      // インデックスが作成されている
      const index = mockStorage['note_page_index'] as Record<string, number[]>;
      expect(index['1']).toEqual([100, 200]);

      // 旧キーが削除されている
      expect(mockStorage['notes_1']).toBeUndefined();

      // マイグレーションフラグが設定されている
      expect(mockStorage['note_storage_v2_migrated']).toBe(true);
    });

    it('IDのないノートはスキップする', async () => {
      const legacyNotes = [{ id: 100, title: 'Has ID' }, { title: 'No ID' }];
      mockStorage['notes_1'] = legacyNotes;

      await migrateStorageIfNeeded();

      const index = mockStorage['note_page_index'] as Record<string, number[]>;
      expect(index['1']).toEqual([100]);
    });

    it('配列でないデータはスキップする', async () => {
      mockStorage['notes_1'] = 'invalid data';

      await migrateStorageIfNeeded();

      const index = mockStorage['note_page_index'] as Record<string, number[]>;
      // 空のインデックスが保存される（ノートは追加されない）
      expect(index).toEqual({});
      expect(mockStorage['note_storage_v2_migrated']).toBe(true);
    });

    it('無効なページIDはスキップする', async () => {
      mockStorage['notes_abc'] = [{ id: 100 }];

      await migrateStorageIfNeeded();

      const index = mockStorage['note_page_index'] as Record<string, number[]>;
      // NaNのpageIdはスキップされるが空インデックスは保存される
      expect(index).toEqual({});
    });
  });
});
