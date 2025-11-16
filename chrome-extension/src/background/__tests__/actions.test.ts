import {
  fetchAllNotes,
  fetchAllNotesAndPageInfo,
  fetchAllNotesByPageUrl,
  createNote,
  updateNote,
  deleteNote,
  fetchAllPageInfo,
  updatePageInfo,
  scrollTo,
  getIsVisibleNote,
  setIsVisibleNote,
  getDefaultColor,
  setDefaultColor,
  getSetting,
  setBadgeText,
  setBadgeUnavailable,
} from '../actions.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Note } from '@extension/shared/lib/types/Note';
import type { PageInfo } from '@extension/shared/lib/types/PageInfo';

// Mock storage modules
vi.mock('@extension/shared/lib/storages/defaultColorStorage', () => ({
  getDefaultColor: vi.fn(),
  setDefaultColor: vi.fn(),
}));

vi.mock('@extension/shared/lib/storages/noteStorage', () => ({
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getAllNotesByPageId: vi.fn(),
  getAllNotes: vi.fn(),
}));

vi.mock('@extension/shared/lib/storages/noteVisibleStorage', () => ({
  getIsVisibleNote: vi.fn(),
  setIsVisibleNote: vi.fn(),
}));

vi.mock('@extension/shared/lib/storages/pageInfoStorage', () => ({
  getAllPageInfos: vi.fn(),
  updatePageInfo: vi.fn(),
  setUpdatedAtPageInfo: vi.fn(),
  getOrCreatePageInfoByUrl: vi.fn(),
  getPageInfoByUrl: vi.fn(),
}));

describe('background/actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllNotes', () => {
    it('should fetch all notes', async () => {
      const mockNotes: Note[] = [
        {
          id: 'note-1',
          page_info_id: 'page-1',
          title: 'Note 1',
          description: 'Description 1',
          position_x: 100,
          position_y: 100,
          width: 200,
          height: 200,
          is_fixed_position: false,
          background_color: '#ffeb3b',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { getAllNotes } = await import('@extension/shared/lib/storages/noteStorage');
      vi.mocked(getAllNotes).mockResolvedValue(mockNotes);

      const result = await fetchAllNotes();

      expect(result).toEqual(mockNotes);
      expect(getAllNotes).toHaveBeenCalledOnce();
    });
  });

  describe('fetchAllNotesAndPageInfo', () => {
    it('should fetch all notes and related page infos', async () => {
      const mockNotes: Note[] = [
        {
          id: 'note-1',
          page_info_id: 'page-1',
          title: 'Note 1',
          description: 'Description 1',
          position_x: 100,
          position_y: 100,
          width: 200,
          height: 200,
          is_fixed_position: false,
          background_color: '#ffeb3b',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockPageInfos: PageInfo[] = [
        {
          id: 'page-1',
          url: 'https://example.com',
          title: 'Example',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'page-2',
          url: 'https://example2.com',
          title: 'Example 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { getAllNotes } = await import('@extension/shared/lib/storages/noteStorage');
      const { getAllPageInfos } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(getAllNotes).mockResolvedValue(mockNotes);
      vi.mocked(getAllPageInfos).mockResolvedValue(mockPageInfos);

      const result = await fetchAllNotesAndPageInfo();

      expect(result.notes).toEqual(mockNotes);
      // page-2は対応するnoteが存在しないためフィルタリングされる
      expect(result.pageInfos).toEqual([mockPageInfos[0]]);
      expect(getAllNotes).toHaveBeenCalledOnce();
      expect(getAllPageInfos).toHaveBeenCalledOnce();
    });

    it('should return empty pageInfos when no notes exist', async () => {
      const { getAllNotes } = await import('@extension/shared/lib/storages/noteStorage');
      const { getAllPageInfos } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(getAllNotes).mockResolvedValue([]);
      vi.mocked(getAllPageInfos).mockResolvedValue([
        {
          id: 'page-1',
          url: 'https://example.com',
          title: 'Example',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await fetchAllNotesAndPageInfo();

      expect(result.notes).toEqual([]);
      expect(result.pageInfos).toEqual([]);
    });
  });

  describe('fetchAllNotesByPageUrl', () => {
    it('should fetch notes by page URL', async () => {
      const mockPageInfo: PageInfo = {
        id: 'page-1',
        url: 'https://example.com',
        title: 'Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockNotes: Note[] = [
        {
          id: 'note-1',
          page_info_id: 'page-1',
          title: 'Note 1',
          description: 'Description 1',
          position_x: 100,
          position_y: 100,
          width: 200,
          height: 200,
          is_fixed_position: false,
          background_color: '#ffeb3b',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { getPageInfoByUrl } = await import('@extension/shared/lib/storages/pageInfoStorage');
      const { getAllNotesByPageId } = await import('@extension/shared/lib/storages/noteStorage');

      vi.mocked(getPageInfoByUrl).mockResolvedValue(mockPageInfo);
      vi.mocked(getAllNotesByPageId).mockResolvedValue(mockNotes);

      const result = await fetchAllNotesByPageUrl('https://example.com');

      expect(result).toEqual(mockNotes);
      expect(getPageInfoByUrl).toHaveBeenCalledWith('https://example.com');
      expect(getAllNotesByPageId).toHaveBeenCalledWith('page-1');
    });

    it('should return empty array when page info not found', async () => {
      const { getPageInfoByUrl } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(getPageInfoByUrl).mockResolvedValue(null);

      const result = await fetchAllNotesByPageUrl('https://nonexistent.com');

      expect(result).toEqual([]);
    });

    it('should return empty array when page info has no id', async () => {
      const { getPageInfoByUrl } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(getPageInfoByUrl).mockResolvedValue({
        url: 'https://example.com',
        title: 'Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await fetchAllNotesByPageUrl('https://example.com');

      expect(result).toEqual([]);
    });
  });

  describe('createNote', () => {
    it('should create a note and return all notes', async () => {
      const mockPageInfo: PageInfo = {
        id: 'page-1',
        url: 'https://example.com',
        title: 'Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockAllNotes: Note[] = [
        {
          id: 'note-1',
          page_info_id: 'page-1',
          title: '',
          description: '',
          position_x: 100,
          position_y: 100,
          width: 200,
          height: 200,
          is_fixed_position: false,
          background_color: '#ffeb3b',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { getOrCreatePageInfoByUrl, setUpdatedAtPageInfo } = await import(
        '@extension/shared/lib/storages/pageInfoStorage'
      );
      const { createNote: _createNote } = await import('@extension/shared/lib/storages/noteStorage');

      vi.mocked(getOrCreatePageInfoByUrl).mockResolvedValue(mockPageInfo);
      vi.mocked(_createNote).mockResolvedValue({
        note: mockAllNotes[0],
        allNotes: mockAllNotes,
      });
      vi.mocked(setUpdatedAtPageInfo).mockResolvedValue(mockPageInfo);

      const result = await createNote('https://example.com');

      expect(result).toEqual(mockAllNotes);
      expect(getOrCreatePageInfoByUrl).toHaveBeenCalledWith('https://example.com');
      expect(_createNote).toHaveBeenCalledWith('page-1');
      expect(setUpdatedAtPageInfo).toHaveBeenCalledWith('page-1');
    });
  });

  describe('updateNote', () => {
    it('should update a note and return all notes', async () => {
      const mockNote: Note = {
        id: 'note-1',
        page_info_id: 'page-1',
        title: 'Updated Note',
        description: 'Updated Description',
        position_x: 150,
        position_y: 150,
        width: 250,
        height: 250,
        is_fixed_position: true,
        background_color: '#4caf50',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockAllNotes: Note[] = [mockNote];

      const { updateNote: _updateNote } = await import('@extension/shared/lib/storages/noteStorage');
      const { setUpdatedAtPageInfo } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(_updateNote).mockResolvedValue({
        note: mockNote,
        allNotes: mockAllNotes,
      });
      vi.mocked(setUpdatedAtPageInfo).mockResolvedValue({
        id: 'page-1',
        url: 'https://example.com',
        title: 'Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await updateNote(mockNote);

      expect(result).toEqual(mockAllNotes);
      expect(_updateNote).toHaveBeenCalledWith('page-1', mockNote);
      expect(setUpdatedAtPageInfo).toHaveBeenCalledWith('page-1');
    });

    it('should return empty array when note has no page_info_id', async () => {
      const mockNote: Note = {
        id: 'note-1',
        title: 'Note without page',
        description: '',
        position_x: 100,
        position_y: 100,
        width: 200,
        height: 200,
        is_fixed_position: false,
        background_color: '#ffeb3b',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await updateNote(mockNote);

      expect(result).toEqual([]);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note and return remaining notes', async () => {
      const mockNote: Note = {
        id: 'note-1',
        page_info_id: 'page-1',
        title: 'Note to delete',
        description: '',
        position_x: 100,
        position_y: 100,
        width: 200,
        height: 200,
        is_fixed_position: false,
        background_color: '#ffeb3b',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockRemainingNotes: Note[] = [];

      const { deleteNote: _deleteNote } = await import('@extension/shared/lib/storages/noteStorage');

      vi.mocked(_deleteNote).mockResolvedValue({
        note: mockNote,
        allNotes: mockRemainingNotes,
      });

      const result = await deleteNote(mockNote);

      expect(result).toEqual(mockRemainingNotes);
      expect(_deleteNote).toHaveBeenCalledWith('page-1', 'note-1');
    });

    it('should return empty array when note has no page_info_id', async () => {
      const mockNote: Note = {
        id: 'note-1',
        title: 'Note without page',
        description: '',
        position_x: 100,
        position_y: 100,
        width: 200,
        height: 200,
        is_fixed_position: false,
        background_color: '#ffeb3b',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await deleteNote(mockNote);

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllPageInfo', () => {
    it('should fetch all page infos', async () => {
      const mockPageInfos: PageInfo[] = [
        {
          id: 'page-1',
          url: 'https://example.com',
          title: 'Example',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { getAllPageInfos } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(getAllPageInfos).mockResolvedValue(mockPageInfos);

      const result = await fetchAllPageInfo();

      expect(result).toEqual(mockPageInfos);
      expect(getAllPageInfos).toHaveBeenCalledOnce();
    });
  });

  describe('updatePageInfo', () => {
    it('should update page info and return all page infos', async () => {
      const mockPageInfo: PageInfo = {
        id: 'page-1',
        url: 'https://example.com',
        title: 'Updated Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockAllPageInfos: PageInfo[] = [mockPageInfo];

      const { updatePageInfo: _updatePageInfo } = await import('@extension/shared/lib/storages/pageInfoStorage');

      vi.mocked(_updatePageInfo).mockResolvedValue({
        pageInfo: mockPageInfo,
        allPageInfos: mockAllPageInfos,
      });

      const result = await updatePageInfo(mockPageInfo);

      expect(result).toEqual(mockAllPageInfos);
      expect(_updatePageInfo).toHaveBeenCalledWith(mockPageInfo);
    });

    it('should return empty array when page info has no id', async () => {
      const mockPageInfo: PageInfo = {
        url: 'https://example.com',
        title: 'Example',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await updatePageInfo(mockPageInfo);

      expect(result).toEqual([]);
    });
  });

  describe('scrollTo', () => {
    it('should execute scroll script on specified tab', async () => {
      const mockNote: Note = {
        id: 'note-1',
        page_info_id: 'page-1',
        title: 'Note',
        description: '',
        position_x: 500,
        position_y: 300,
        width: 200,
        height: 200,
        is_fixed_position: false,
        background_color: '#ffeb3b',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await scrollTo(1, mockNote);

      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
        args: [500, 300],
      });
    });
  });

  describe('settings', () => {
    describe('getIsVisibleNote', () => {
      it('should get visibility setting', async () => {
        const { getIsVisibleNote: _getIsVisibleNote } = await import(
          '@extension/shared/lib/storages/noteVisibleStorage'
        );

        vi.mocked(_getIsVisibleNote).mockResolvedValue(true);

        const result = await getIsVisibleNote();

        expect(result).toBe(true);
        expect(_getIsVisibleNote).toHaveBeenCalledOnce();
      });
    });

    describe('setIsVisibleNote', () => {
      it('should set visibility setting', async () => {
        const { setIsVisibleNote: _setIsVisibleNote } = await import(
          '@extension/shared/lib/storages/noteVisibleStorage'
        );

        vi.mocked(_setIsVisibleNote).mockResolvedValue(undefined);

        const result = await setIsVisibleNote(false);

        expect(result).toBe(false);
        expect(_setIsVisibleNote).toHaveBeenCalledWith(false);
      });
    });

    describe('getDefaultColor', () => {
      it('should get default color setting', async () => {
        const { getDefaultColor: _getDefaultColor } = await import(
          '@extension/shared/lib/storages/defaultColorStorage'
        );

        vi.mocked(_getDefaultColor).mockResolvedValue('#ffeb3b');

        const result = await getDefaultColor();

        expect(result).toBe('#ffeb3b');
        expect(_getDefaultColor).toHaveBeenCalledOnce();
      });
    });

    describe('setDefaultColor', () => {
      it('should set default color and return full settings', async () => {
        const { setDefaultColor: _setDefaultColor } = await import(
          '@extension/shared/lib/storages/defaultColorStorage'
        );
        const { getDefaultColor: _getDefaultColor } = await import(
          '@extension/shared/lib/storages/defaultColorStorage'
        );
        const { getIsVisibleNote: _getIsVisibleNote } = await import(
          '@extension/shared/lib/storages/noteVisibleStorage'
        );

        vi.mocked(_setDefaultColor).mockResolvedValue(undefined);
        vi.mocked(_getDefaultColor).mockResolvedValue('#4caf50');
        vi.mocked(_getIsVisibleNote).mockResolvedValue(true);

        const result = await setDefaultColor('#4caf50');

        expect(result).toEqual({
          is_visible: true,
          default_color: '#4caf50',
        });
        expect(_setDefaultColor).toHaveBeenCalledWith('#4caf50');
      });
    });

    describe('getSetting', () => {
      it('should get all settings', async () => {
        const { getDefaultColor: _getDefaultColor } = await import(
          '@extension/shared/lib/storages/defaultColorStorage'
        );
        const { getIsVisibleNote: _getIsVisibleNote } = await import(
          '@extension/shared/lib/storages/noteVisibleStorage'
        );

        vi.mocked(_getIsVisibleNote).mockResolvedValue(true);
        vi.mocked(_getDefaultColor).mockResolvedValue('#ffeb3b');

        const result = await getSetting();

        expect(result).toEqual({
          is_visible: true,
          default_color: '#ffeb3b',
        });
        expect(_getIsVisibleNote).toHaveBeenCalledOnce();
        expect(_getDefaultColor).toHaveBeenCalledOnce();
      });
    });
  });

  describe('badge', () => {
    describe('setBadgeText', () => {
      it('should set badge text with number', () => {
        setBadgeText(1, 5);

        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '5' });
        expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: '#000' });
      });

      it('should set badge text with string', () => {
        setBadgeText(1, '10');

        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '10' });
        expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: '#000' });
      });

      it('should clear badge when no note length provided', () => {
        setBadgeText(1);

        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '' });
        expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: '#000' });
      });
    });

    describe('setBadgeUnavailable', () => {
      it('should set unavailable badge', () => {
        setBadgeUnavailable(1);

        expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'x' });
        expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: 'red' });
      });
    });
  });
});
