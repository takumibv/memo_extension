import {
  createPageInfo,
  updatePageInfo,
  setUpdatedAtPageInfo,
  deletePageInfo,
  getAllPageInfos,
  getPageInfoByUrl,
  getOrCreatePageInfoByUrl,
} from '../pageInfoStorage.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PageInfo } from '../../types/PageInfo.js';

describe('pageInfoStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    delete (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError;
  });

  describe('createPageInfo', () => {
    it('should create new page info with tab data', async () => {
      const url = 'https://example.com/page';
      const mockTab = {
        url: 'https://example.com/page',
        title: 'Example Page',
        favIconUrl: 'https://example.com/favicon.ico',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);

      const result = await createPageInfo(url);

      expect(result.pageInfo).toBeDefined();
      expect(result.pageInfo?.id).toBeDefined();
      expect(result.pageInfo?.page_url).toBe('https://example.com/page');
      expect(result.pageInfo?.page_title).toBe('Example Page');
      expect(result.pageInfo?.fav_icon_url).toBe('https://example.com/favicon.ico');
      expect(result.pageInfo?.created_at).toBeDefined();
      expect(result.allPageInfos).toHaveLength(1);
    });

    it('should normalize URL before creating page info', async () => {
      const urlWithHash = 'https://example.com/page#section';
      const mockTab = {
        url: 'https://example.com/page',
        title: 'Example Page',
        favIconUrl: 'https://example.com/favicon.ico',
      };

      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);

      const result = await createPageInfo(urlWithHash);

      // formURL()によってハッシュが除去される
      expect(result.pageInfo?.page_url).toBe('https://example.com/page');
    });

    it('should throw error when tab is not found', async () => {
      const url = 'https://example.com/nonexistent';

      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(createPageInfo(url)).rejects.toThrow('tab is not found');
    });

    it('should add to existing page infos', async () => {
      const existingPageInfos: PageInfo[] = [
        { id: 1, page_url: 'https://example1.com', page_title: 'Page 1', created_at: '2024-01-01' },
      ];

      const url = 'https://example2.com';
      const mockTab = {
        url: 'https://example2.com',
        title: 'Page 2',
        favIconUrl: 'https://example2.com/favicon.ico',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: existingPageInfos,
      });
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);

      const result = await createPageInfo(url);

      expect(result.allPageInfos).toHaveLength(2);
      expect(result.allPageInfos[0]).toEqual(existingPageInfos[0]);
      expect(result.allPageInfos[1]).toEqual(result.pageInfo);
    });

    it('should throw error when storage fails', async () => {
      const url = 'https://example.com';
      const mockTab = { url, title: 'Test', favIconUrl: 'test.ico' };

      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(createPageInfo(url)).rejects.toThrow();
    });
  });

  describe('updatePageInfo', () => {
    it('should update existing page info', async () => {
      const existingPageInfo: PageInfo = {
        id: 1,
        page_url: 'https://example.com',
        page_title: 'Old Title',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [existingPageInfo],
      });

      const updatedPageInfo: PageInfo = {
        ...existingPageInfo,
        page_title: 'New Title',
      };

      const result = await updatePageInfo(updatedPageInfo);

      expect(result.pageInfo).toEqual(updatedPageInfo);
      expect(result.allPageInfos).toHaveLength(1);
      expect(result.allPageInfos[0].page_title).toBe('New Title');
      expect(result.allPageInfos[0].updated_at).toBeDefined();
      expect(result.allPageInfos[0].updated_at).not.toBe(existingPageInfo.created_at);
    });

    it('should reject when page info has no id', async () => {
      const pageInfoWithoutId: PageInfo = {
        page_url: 'https://example.com',
        page_title: 'Test',
      };

      await expect(updatePageInfo(pageInfoWithoutId)).rejects.toBe('id is required');
    });

    it('should update only matching page info', async () => {
      const pageInfos: PageInfo[] = [
        { id: 1, page_title: 'Page 1', created_at: '2024-01-01' },
        { id: 2, page_title: 'Page 2', created_at: '2024-01-02' },
        { id: 3, page_title: 'Page 3', created_at: '2024-01-03' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const updatedPageInfo: PageInfo = {
        id: 2,
        page_title: 'Updated Page 2',
      };

      const result = await updatePageInfo(updatedPageInfo);

      expect(result.allPageInfos).toHaveLength(3);
      expect(result.allPageInfos[0].page_title).toBe('Page 1');
      expect(result.allPageInfos[1].page_title).toBe('Updated Page 2');
      expect(result.allPageInfos[2].page_title).toBe('Page 3');
    });
  });

  describe('setUpdatedAtPageInfo', () => {
    it('should update only the updated_at field', async () => {
      const pageInfo: PageInfo = {
        id: 1,
        page_url: 'https://example.com',
        page_title: 'Test Page',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [pageInfo],
      });

      const result = await setUpdatedAtPageInfo(1);

      expect(result.allPageInfos).toHaveLength(1);
      expect(result.allPageInfos[0].page_url).toBe('https://example.com');
      expect(result.allPageInfos[0].page_title).toBe('Test Page');
      expect(result.allPageInfos[0].updated_at).toBeDefined();
      expect(result.allPageInfos[0].updated_at).not.toBe(pageInfo.created_at);
    });

    it('should update correct page info when multiple exist', async () => {
      const pageInfos: PageInfo[] = [
        { id: 1, page_title: 'Page 1', created_at: '2024-01-01' },
        { id: 2, page_title: 'Page 2', created_at: '2024-01-02' },
        { id: 3, page_title: 'Page 3', created_at: '2024-01-03' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const result = await setUpdatedAtPageInfo(2);

      expect(result.allPageInfos[0].updated_at).toBeUndefined();
      expect(result.allPageInfos[1].updated_at).toBeDefined();
      expect(result.allPageInfos[2].updated_at).toBeUndefined();
    });
  });

  describe('deletePageInfo', () => {
    it('should delete page info by id', async () => {
      const pageInfos: PageInfo[] = [
        { id: 1, page_title: 'Page 1', created_at: '2024-01-01' },
        { id: 2, page_title: 'Page 2', created_at: '2024-01-02' },
        { id: 3, page_title: 'Page 3', created_at: '2024-01-03' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const result = await deletePageInfo(2);

      expect(result.pageInfo).toEqual(pageInfos[1]);
      expect(result.allPageInfos).toHaveLength(2);
      expect(result.allPageInfos[0]).toEqual(pageInfos[0]);
      expect(result.allPageInfos[1]).toEqual(pageInfos[2]);
    });

    it('should reject when id is not provided', async () => {
      await expect(deletePageInfo(0)).rejects.toBe('id is required');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(deletePageInfo(null as any)).rejects.toBe('id is required');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(deletePageInfo(undefined as any)).rejects.toBe('id is required');
    });

    it('should throw error when storage fails', async () => {
      const pageInfo: PageInfo = { id: 1, page_title: 'Test' };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [pageInfo],
      });
      (chrome.storage.local.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Storage error'));

      await expect(deletePageInfo(1)).rejects.toThrow();
    });
  });

  describe('getAllPageInfos', () => {
    it('should return all page infos', async () => {
      const pageInfos: PageInfo[] = [
        { id: 1, page_url: 'https://example1.com', page_title: 'Page 1' },
        { id: 2, page_url: 'https://example2.com', page_title: 'Page 2' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const result = await getAllPageInfos();

      expect(result).toEqual(pageInfos);
    });

    it('should return empty array when no page infos exist', async () => {
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await getAllPageInfos();

      expect(result).toEqual([]);
    });
  });

  describe('getPageInfoByUrl', () => {
    it('should return page info matching URL', async () => {
      const pageInfos: PageInfo[] = [
        { id: 1, page_url: 'https://example1.com/', page_title: 'Page 1' },
        { id: 2, page_url: 'https://example2.com/', page_title: 'Page 2' },
      ];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const result = await getPageInfoByUrl('https://example2.com');

      expect(result).toEqual(pageInfos[1]);
    });

    it('should normalize URL before searching', async () => {
      const pageInfos: PageInfo[] = [{ id: 1, page_url: 'https://example.com/page', page_title: 'Test Page' }];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      // ハッシュ付きURLで検索
      const result = await getPageInfoByUrl('https://example.com/page#section');

      expect(result).toEqual(pageInfos[0]);
    });

    it('should return undefined when page info not found', async () => {
      const pageInfos: PageInfo[] = [{ id: 1, page_url: 'https://example.com', page_title: 'Page' }];

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: pageInfos,
      });

      const result = await getPageInfoByUrl('https://notfound.com');

      expect(result).toBeUndefined();
    });
  });

  describe('getOrCreatePageInfoByUrl', () => {
    it('should return existing page info if found', async () => {
      const existingPageInfo: PageInfo = {
        id: 1,
        page_url: 'https://example.com/',
        page_title: 'Existing Page',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [existingPageInfo],
      });

      const result = await getOrCreatePageInfoByUrl('https://example.com');

      expect(result).toEqual(existingPageInfo);
      // tabs.queryは呼ばれない（新規作成しないため）
      expect(chrome.tabs.query).not.toHaveBeenCalled();
    });

    it('should create new page info if not found', async () => {
      const url = 'https://newpage.com';
      const mockTab = {
        url,
        title: 'New Page',
        favIconUrl: 'https://newpage.com/favicon.ico',
      };

      // 1回目：既存のページ情報取得（空）
      // 2回目：createPageInfo内でのgetAllPageInfos
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({}).mockResolvedValueOnce({});

      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);

      const result = await getOrCreatePageInfoByUrl(url);

      expect(result).toBeDefined();
      expect(result.page_url).toBe('https://newpage.com/'); // formURLで正規化される
      expect(result.page_title).toBe('New Page');
      expect(chrome.tabs.query).toHaveBeenCalledWith({ url: 'https://newpage.com/' });
    });

    it('should handle URL normalization', async () => {
      const existingPageInfo: PageInfo = {
        id: 1,
        page_url: 'https://example.com/page',
        page_title: 'Test Page',
      };

      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [existingPageInfo],
      });

      // ハッシュ付きURLで検索しても見つかる
      const result = await getOrCreatePageInfoByUrl('https://example.com/page#section');

      expect(result).toEqual(existingPageInfo);
      expect(chrome.tabs.query).not.toHaveBeenCalled();
    });
  });

  describe('PageInfo data integrity', () => {
    it('should maintain page info structure through CRUD operations', async () => {
      const url = 'https://example.com';
      const mockTab = {
        url,
        title: 'Example Page',
        favIconUrl: 'https://example.com/favicon.ico',
      };

      // Create
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTab]);

      const createResult = await createPageInfo(url);
      const pageInfo = createResult.pageInfo!;

      expect(pageInfo.id).toBeDefined();
      expect(pageInfo.page_url).toBe('https://example.com/'); // formURLで正規化される
      expect(pageInfo.created_at).toBeDefined();

      // Update
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: [pageInfo],
      });

      const updatedPageInfo: PageInfo = {
        ...pageInfo,
        page_title: 'Updated Title',
      };

      const updateResult = await updatePageInfo(updatedPageInfo);

      expect(updateResult.allPageInfos[0].page_title).toBe('Updated Title');
      expect(updateResult.allPageInfos[0].id).toBe(pageInfo.id);
      expect(updateResult.allPageInfos[0].updated_at).toBeDefined();

      // Delete
      (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        page_info: updateResult.allPageInfos,
      });

      const deleteResult = await deletePageInfo(pageInfo.id!);

      expect(deleteResult.pageInfo?.id).toBe(pageInfo.id);
      expect(deleteResult.allPageInfos).toHaveLength(0);
    });

    it('should handle multiple page infos without conflicts', async () => {
      const mockTabs = [
        { url: 'https://example1.com', title: 'Page 1', favIconUrl: 'icon1.ico' },
        { url: 'https://example2.com', title: 'Page 2', favIconUrl: 'icon2.ico' },
        { url: 'https://example3.com', title: 'Page 3', favIconUrl: 'icon3.ico' },
      ];

      // Create multiple page infos
      let allPageInfos: PageInfo[] = [];

      for (let i = 0; i < mockTabs.length; i++) {
        (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
          page_info: allPageInfos,
        });
        (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockTabs[i]]);

        const result = await createPageInfo(mockTabs[i].url);
        allPageInfos = result.allPageInfos;
      }

      expect(allPageInfos).toHaveLength(3);

      // すべてのIDがユニーク
      const ids = allPageInfos.map(p => p.id);
      expect(new Set(ids).size).toBe(3);

      // すべてのURLが正しく保存されている（formURLで正規化される）
      expect(allPageInfos.map(p => p.page_url)).toEqual([
        'https://example1.com/',
        'https://example2.com/',
        'https://example3.com/',
      ]);
    });
  });
});
