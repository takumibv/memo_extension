import { PageInfo } from "../types/PageInfo";
import { encodeFormURL, formURL } from "../utils";
import { getNewId, getStorage, setStorage } from "./common";

const PAGE_INFO_STORAGE_NAME = "page_info";

const getPageInfoStorage = async (): Promise<PageInfo[]> => {
  const storage = await getStorage(PAGE_INFO_STORAGE_NAME);
  return (storage[PAGE_INFO_STORAGE_NAME] || []) as PageInfo[];
};

const setPageInfoStorage = async (pageInfos: PageInfo[]): Promise<boolean> => {
  return await setStorage(PAGE_INFO_STORAGE_NAME, pageInfos);
};

export type PageInfoCRUDResponseType = { pageInfo?: PageInfo; allPageInfos: PageInfo[] };

export const createPageInfo = async (url: string): Promise<PageInfoCRUDResponseType> => {
  const pageInfos = await getAllPageInfos();
  const encodedURL = formURL(url);

  const id = getNewId(pageInfos);
  const [tab] = await chrome.tabs.query({ url: formURL(url) });

  if (!tab) throw new Error(`tab is not found: ${url}`);

  const newPageInfo: PageInfo = {
    id,
    page_url: encodedURL,
    page_title: tab.title,
    fav_icon_url: tab.favIconUrl,
    created_at: new Date().toISOString(),
  };
  const allPageInfos = [...pageInfos, newPageInfo];

  if (await setPageInfoStorage(allPageInfos)) return { pageInfo: newPageInfo, allPageInfos };

  throw new Error("createPageInfo failed: " + chrome.runtime.lastError?.message);
};

export const updatePageInfo = async (pageInfo: PageInfo): Promise<PageInfoCRUDResponseType> => {
  if (!pageInfo.id) return new Promise((_resolve, reject) => reject("id is required"));

  const pageInfos = await getAllPageInfos();
  const allPageInfos = pageInfos.map((_pageInfo) =>
    _pageInfo.id === pageInfo.id ? { ...pageInfo, updated_at: new Date().toISOString() } : _pageInfo
  );

  if (await setPageInfoStorage(allPageInfos)) return { pageInfo, allPageInfos };

  throw new Error("updatePageInfo failed: " + chrome.runtime.lastError?.message);
};

export const setUpdatedAtPageInfo = async (pageInfoId: number): Promise<PageInfoCRUDResponseType> => {
  const pageInfos = await getAllPageInfos();
  const allPageInfos: PageInfo[] = pageInfos.map((_pageInfo) =>
    _pageInfo.id === pageInfoId ? { ..._pageInfo, updated_at: new Date().toISOString() } : _pageInfo
  );
  if (await setPageInfoStorage(allPageInfos)) return { allPageInfos };

  throw new Error("updatePageInfo failed: " + chrome.runtime.lastError?.message);
}

export const getAllPageInfos = async (): Promise<PageInfo[]> => {
  return await getPageInfoStorage();
};

export const getPageInfoById = async (pageId: number): Promise<PageInfo> => {
  // TODO
  return new Promise((_resolve, reject) => reject("getPageInfoById is not implemented"));
};

export const getPageInfoByUrl = async (url: string): Promise<PageInfo | undefined> => {
  const encodedURL = formURL(url);
  const pageInfos = await getAllPageInfos();

  return pageInfos.find((_pageInfo) => _pageInfo.page_url === encodedURL);
};

export const getOrCreatePageInfoByUrl = async (url: string): Promise<PageInfo> => {
  const pageInfo = await getPageInfoByUrl(url);

  if (pageInfo) return pageInfo;

  const { pageInfo: newPageInfo } = await createPageInfo(url);

  return newPageInfo!;
};

export const deletePageInfo = async (pageId: number): Promise<PageInfoCRUDResponseType> => {
  if (!pageId) return new Promise((_resolve, reject) => reject("id is required"));

  const pageInfos = await getAllPageInfos();
  const pageInfo = pageInfos.find((_pageInfo) => _pageInfo.id === pageId);
  const allPageInfos = pageInfos.filter((_pageInfo) => _pageInfo.id !== pageId);

  if (await setPageInfoStorage(allPageInfos)) return { pageInfo, allPageInfos };

  // TODO 削除したPageInfoを履歴に残す

  throw new Error("deletePageInfo failed: " + chrome.runtime.lastError?.message);
};
