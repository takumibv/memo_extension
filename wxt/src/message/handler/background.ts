import * as actions from '@/background/actions';
import { setupIsVisible, setupPage } from '@/message/sender/background';
import { isToBackgroundMessage } from '@/message/types';
import { isSystemLink } from '@/shared/utils/utils';
import type { ToBackgroundMessage } from '@/message/types';
import type { Note } from '@/shared/types/Note';

const ROOT_DOM_ID = 'react-container-for-note-extension';

const isScriptAllowedPage = async (tabId: number) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {},
    });
    return !chrome.runtime.lastError;
  } catch {
    return false;
  }
};

const hasContentScript = async (tabId: number): Promise<boolean> => {
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const noteDOM = document.getElementById('react-container-for-note-extension');
        return !!noteDOM;
      },
    });
    return res.result as boolean;
  } catch {
    return false;
  }
};

const injectContentScript = async (tabId: number): Promise<boolean> => {
  const hasScript = await hasContentScript(tabId);
  if (hasScript) return false;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Content script ready timeout'));
    }, 3000);

    const messageListener = (message: { type?: string }, sender: chrome.runtime.MessageSender) => {
      if (message.type === 'content:ready' && sender.tab?.id === tabId) {
        cleanup();
        resolve(true);
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      chrome.runtime.onMessage.removeListener(messageListener);
    };

    chrome.runtime.onMessage.addListener(messageListener);

    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ['content-scripts/content.js'],
      })
      .catch(error => {
        cleanup();
        reject(error);
      });
  });
};

// ===== メッセージハンドラ =====

const handlePopupMessage = async (
  message: Extract<ToBackgroundMessage, { type: `popup:${string}` }>,
): Promise<unknown> => {
  const { tab } = message.payload;
  const tabId = tab?.id;
  const tabUrl = tab?.url;

  if (!tabId || !tabUrl) throw new Error('このページでは使用できません');
  if (isSystemLink(tabUrl)) throw new Error('このページでは使用できません');

  const isAllowed = await isScriptAllowedPage(tabId);
  if (!isAllowed) throw new Error('このページでは使用できません');

  const injectAndSetup = async (notes: Note[]) => {
    const setting = await actions.getSetting();
    await injectContentScript(tabId).catch(() => {});
    await setupPage(tabId, tabUrl, notes, setting).catch(() => {});
  };

  switch (message.type) {
    case 'popup:getAllNotes': {
      const notes = await actions.fetchAllNotesByPageUrl(tabUrl);
      const isVisible = await actions.getIsVisibleNote();
      return { notes, isVisible };
    }
    case 'popup:createNote': {
      const notes = await actions.createNote(tabUrl);
      actions.setBadgeText(tabId, notes.length);
      await injectAndSetup(notes);
      return { notes };
    }
    case 'popup:updateNote': {
      const notes = await actions.updateNote(message.payload.note);
      await injectAndSetup(notes);
      return { notes };
    }
    case 'popup:deleteNote': {
      const notes = await actions.deleteNote(message.payload.note);
      actions.setBadgeText(tabId, notes.length);
      await injectAndSetup(notes);
      return { notes };
    }
    case 'popup:scrollToNote': {
      await actions.scrollTo(tabId, message.payload.note);
      return {};
    }
    case 'popup:getVisibility': {
      const isVisible = await actions.getIsVisibleNote();
      await injectContentScript(tabId).catch(() => {});
      await setupIsVisible(tabId, tabUrl, isVisible);
      return { isVisible };
    }
    case 'popup:updateVisibility': {
      const isVisible = await actions.setIsVisibleNote(message.payload.isVisible);
      await injectContentScript(tabId).catch(() => {});
      await setupIsVisible(tabId, tabUrl, isVisible);
      return { isVisible };
    }
  }
};

const handleContentMessage = async (
  message: Extract<ToBackgroundMessage, { type: `content:${string}` }>,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> => {
  switch (message.type) {
    case 'content:getAllNotes': {
      const notes = await actions.fetchAllNotesByPageUrl(message.payload.url);
      return { notes };
    }
    case 'content:updateNote': {
      const notes = await actions.updateNote(message.payload.note);
      if (sender.tab?.id) {
        actions.setBadgeText(sender.tab.id, notes.length);
      }
      return { notes };
    }
    case 'content:deleteNote': {
      const notes = await actions.deleteNote(message.payload.note);
      const { url } = message.payload;
      chrome.tabs.query({ url, currentWindow: true }).then(tabs => {
        tabs.forEach(tab => {
          if (tab.id) actions.setBadgeText(tab.id, notes.length);
        });
      });
      return { notes };
    }
    case 'content:getVisibility': {
      const isVisible = await actions.getIsVisibleNote();
      return { isVisible };
    }
    case 'content:ready': {
      return {};
    }
  }
};

const handleOptionsMessage = async (
  message: Extract<ToBackgroundMessage, { type: `options:${string}` }>,
): Promise<unknown> => {
  switch (message.type) {
    case 'options:getAllData': {
      const { notes, pageInfos } = await actions.fetchAllNotesAndPageInfo();
      return { notes, pageInfos };
    }
    case 'options:updateNote': {
      await actions.updateNote(message.payload.note);
      const { notes, pageInfos } = await actions.fetchAllNotesAndPageInfo();
      return { notes, pageInfos };
    }
    case 'options:deleteNote': {
      await actions.deleteNote(message.payload.note);
      const { notes, pageInfos } = await actions.fetchAllNotesAndPageInfo();
      return { notes, pageInfos };
    }
    case 'options:updatePageInfo': {
      const pageInfos = await actions.updatePageInfo(message.payload.pageInfo);
      return { pageInfos };
    }
    case 'options:getSetting': {
      const setting = await actions.getSetting();
      return { setting };
    }
    case 'options:updateDefaultColor': {
      const setting = await actions.setDefaultColor(message.payload.color);
      return { setting };
    }
  }
};

const handleMessage = async (message: ToBackgroundMessage, sender: chrome.runtime.MessageSender): Promise<unknown> => {
  const { type } = message;

  if (type.startsWith('popup:')) {
    return handlePopupMessage(message as Extract<ToBackgroundMessage, { type: `popup:${string}` }>);
  }
  if (type.startsWith('content:')) {
    return handleContentMessage(message as Extract<ToBackgroundMessage, { type: `content:${string}` }>, sender);
  }
  if (type.startsWith('options:')) {
    return handleOptionsMessage(message as Extract<ToBackgroundMessage, { type: `options:${string}` }>);
  }

  throw new Error(`Unknown message type: ${type}`);
};

/**
 * chrome.runtime.onMessage に登録するハンドラ
 */
const handleMessages = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): boolean => {
  if (!isToBackgroundMessage(message)) {
    return false;
  }

  handleMessage(message, sender)
    .then(data => sendResponse({ data }))
    .catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[handleMessages] Error:', errorMessage);
      sendResponse({ error: errorMessage });
    });

  return true; // 非同期レスポンスを使用
};

export { ROOT_DOM_ID, isScriptAllowedPage, hasContentScript, injectContentScript, handleMessages };
