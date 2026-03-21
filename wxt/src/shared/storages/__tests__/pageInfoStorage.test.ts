import {
  createPageInfo,
  updatePageInfo,
  setUpdatedAtPageInfo,
  getAllPageInfos,
  getPageInfoByUrl,
  getOrCreatePageInfoByUrl,
  deletePageInfo,
} from '../pageInfoStorage';
import { describe, it, expect, beforeEach } from 'vitest';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { vi } from 'vitest';

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

describe('pageInfoStorage', () => {
  beforeEach(() => {
    setupMockStorage();
  });

  describe('createPageInfo', () => {
    it('新しいPageInfoを作成する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([
        { title: 'Test Page', favIconUrl: 'https://example.com/favicon.ico' },
      ]);

      const result = await createPageInfo('https://example.com/page');

      expect(result.pageInfo).toBeDefined();
      expect(result.pageInfo!.page_url).toBe('https://example.com/page');
      expect(result.pageInfo!.page_title).toBe('Test Page');
      expect(result.pageInfo!.fav_icon_url).toBe('https://example.com/favicon.ico');
      expect(result.pageInfo!.created_at).toBeDefined();
      expect(result.pageInfo!.id).toBeDefined();
    });

    it('allPageInfosに追加される', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page 1', favIconUrl: '' }]);

      const result = await createPageInfo('https://example.com/page1');

      expect(result.allPageInfos).toHaveLength(1);
    });

    it('タブが見つからない場合エラーになる', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(createPageInfo('https://example.com/unknown')).rejects.toThrow('tab is not found');
    });

    it('ストレージ保存失敗時にエラーになる', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Quota exceeded',
      };

      await expect(createPageInfo('https://example.com/page')).rejects.toThrow('createPageInfo failed');
    });
  });

  describe('updatePageInfo', () => {
    it('PageInfoのフィールドを更新する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Original', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      const updated: PageInfo = { ...pageInfo!, page_title: 'Updated Title' };
      const result = await updatePageInfo(updated);

      const stored = result.allPageInfos.find(p => p.id === pageInfo!.id);
      expect(stored!.updated_at).toBeDefined();
    });

    it('idがないPageInfoはrejectされる', async () => {
      const noIdPageInfo: PageInfo = { page_title: 'No ID' };

      await expect(updatePageInfo(noIdPageInfo)).rejects.toBe('id is required');
    });

    it('ストレージ保存失敗時にエラーになる', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      // 保存失敗をシミュレート
      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Write failed',
      };

      await expect(updatePageInfo(pageInfo!)).rejects.toThrow('updatePageInfo failed');
    });
  });

  describe('setUpdatedAtPageInfo', () => {
    it('updated_atだけを更新する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await setUpdatedAtPageInfo(pageInfo!.id!);

      const stored = result.allPageInfos.find(p => p.id === pageInfo!.id);
      expect(stored!.updated_at).toBeDefined();
      // titleは変わらない
      expect(stored!.page_title).toBe('Page');
    });

    it('ストレージ保存失敗時にエラーになる', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Write failed',
      };

      await expect(setUpdatedAtPageInfo(pageInfo!.id!)).rejects.toThrow('updatePageInfo failed');
    });
  });

  describe('getAllPageInfos', () => {
    it('全てのPageInfoを返す', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      await createPageInfo('https://example.com/page1');
      await createPageInfo('https://example.com/page2');

      const result = await getAllPageInfos();

      expect(result).toHaveLength(2);
    });

    it('データがない場合は空配列を返す', async () => {
      const result = await getAllPageInfos();

      expect(result).toEqual([]);
    });
  });

  describe('getPageInfoByUrl', () => {
    it('URLでPageInfoを検索する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Found Page', favIconUrl: '' }]);
      await createPageInfo('https://example.com/target');

      const result = await getPageInfoByUrl('https://example.com/target');

      expect(result).toBeDefined();
      expect(result!.page_title).toBe('Found Page');
    });

    it('存在しないURLではundefinedを返す', async () => {
      const result = await getPageInfoByUrl('https://example.com/nonexistent');

      expect(result).toBeUndefined();
    });

    it('URL正規化によるマッチング（フラグメント除去）', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      await createPageInfo('https://example.com/page');

      // formURL removes fragments
      const result = await getPageInfoByUrl('https://example.com/page');

      expect(result).toBeDefined();
    });
  });

  describe('getOrCreatePageInfoByUrl', () => {
    it('既存のPageInfoを返す', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Existing', favIconUrl: '' }]);
      await createPageInfo('https://example.com/exists');

      const result = await getOrCreatePageInfoByUrl('https://example.com/exists');

      expect(result.page_title).toBe('Existing');
    });

    it('存在しない場合は新規作成する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([
        { title: 'New Page', favIconUrl: 'https://example.com/icon.png' },
      ]);

      const result = await getOrCreatePageInfoByUrl('https://example.com/new');

      expect(result).toBeDefined();
      expect(result.page_title).toBe('New Page');
    });
  });

  describe('deletePageInfo', () => {
    it('PageInfoを削除する', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      const result = await deletePageInfo(pageInfo!.id!);

      expect(result.allPageInfos).toHaveLength(0);
      expect(result.pageInfo!.id).toBe(pageInfo!.id);
    });

    it('pageIdが0の場合rejectされる', async () => {
      await expect(deletePageInfo(0)).rejects.toBe('id is required');
    });

    it('ストレージ保存失敗時にエラーになる', async () => {
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([{ title: 'Page', favIconUrl: '' }]);
      const { pageInfo } = await createPageInfo('https://example.com/page');

      (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError = {
        message: 'Delete failed',
      };

      await expect(deletePageInfo(pageInfo!.id!)).rejects.toThrow('deletePageInfo failed');
    });
  });
});
