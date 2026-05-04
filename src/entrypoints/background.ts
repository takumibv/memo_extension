import * as actions from '@/background/actions';
import { cache } from '@/background/cache';
import {
  handleMessages,
  injectContentScript,
  isScriptAllowedPage,
  hasContentScript,
} from '@/message/handler/background';
import { setupPage } from '@/message/sender/background';
import { analytics } from '@/shared/analytics/ga4';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { createNote, migrateStorageIfNeeded } from '@/shared/storages/noteStorage';
import { getOrCreatePageInfoByUrl } from '@/shared/storages/pageInfoStorage';
import { isSystemLink } from '@/shared/utils/utils';

export const ROOT_DOM_ID = 'react-container-for-note-extension';

export default defineBackground(() => {
  // ストレージマイグレーション（旧形式→インデックス方式）
  migrateStorageIfNeeded().then(result => {
    switch (result.status) {
      case 'already_done':
        analytics.trackMigrationSkip('already_done');
        break;
      case 'no_legacy_data':
        analytics.trackMigrationSkip('no_legacy_data');
        break;
      case 'success':
        analytics.trackMigrationSuccess(result.noteCount, result.pageCount);
        break;
      case 'retry_success':
        analytics.trackMigrationRetrySuccess(result.attempt, result.noteCount, result.pageCount);
        break;
      case 'error':
        console.error('[Background] Storage migration failed after retries:', result.error);
        analytics.trackMigrationError(result.error, result.attempts);
        break;
    }
  });

  // install or Updateして初めて開いた時に呼ばれる
  chrome.runtime.onInstalled.addListener(details => {
    const previousVersion = details.previousVersion || 'x.x.x';

    if (previousVersion === '0.3.1') {
      actions.setDefaultColor('#FFF7CC');
    }

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL && previousVersion === 'x.x.x') {
      chrome.tabs.create({
        url: `${chrome.runtime.getURL('options.html')}#init`,
      });
    }

    console.log('previousVersion', previousVersion);
    analytics.trackInstall(details.reason, previousVersion);
  });

  // 右クリックメニュー
  chrome.contextMenus.create({
    id: 'note-extension-context-menu-create',
    title: t(I18N.ADD_NOTE),
    contexts: ['page', 'frame', 'editable', 'image', 'video', 'audio', 'link', 'selection'],
  });

  chrome.contextMenus.onClicked.addListener(info => {
    const { pageUrl } = info;

    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab?.id || !pageUrl) return;

      isScriptAllowedPage(tab.id)
        .then(isAllowed => {
          if (isAllowed) {
            getOrCreatePageInfoByUrl(pageUrl).then(pageInfo => {
              if (!pageInfo.id) return;

              createNote(pageInfo.id).then(({ allNotes }) => {
                cache.badge[tab.id!] = allNotes.length;

                actions.getSetting().then(setting => {
                  if (!tab?.id) return;

                  injectContentScript(tab.id).then(() =>
                    setupPage(tab.id!, pageUrl, allNotes, setting).catch(() => {
                      /* error */
                    }),
                  );
                });
              });
            });
          }
        })
        .catch(() => {
          chrome.runtime.openOptionsPage?.();
        });
    });
  });

  // キーボードショートカット (chrome.commands)
  // ユーザーが chrome://extensions/shortcuts で割り当て可能。デフォルトは未割り当て (OFF)
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command !== 'create-note') return;

    const tabId = tab?.id;
    const tabUrl = tab?.url;
    if (!tabId || !tabUrl) return;
    if (isSystemLink(tabUrl)) return;

    try {
      const isAllowed = await isScriptAllowedPage(tabId);
      if (!isAllowed) return;

      const [notes, setting] = await Promise.all([actions.createNote(tabUrl), actions.getSetting()]);
      cache.badge[tabId] = notes.length;
      actions.setBadgeText(tabId, notes.length);

      await injectContentScript(tabId);
      await setupPage(tabId, tabUrl, notes, setting);
    } catch {
      /* error */
    }
  });

  // タブごとに最後に処理したURLを記録
  const lastSetupUrl = new Map<number, string>();

  const setupTabNotes = (tabId: number, url: string) => {
    if (isSystemLink(url)) return;

    isScriptAllowedPage(tabId).then(isAllowed => {
      if (isAllowed) {
        actions
          .fetchAllNotesByPageUrl(url)
          .then(notes => {
            actions.getSetting().then(setting => {
              if (notes.length === 0) {
                hasContentScript(tabId)
                  .then(has => {
                    if (has) {
                      setupPage(tabId, url, [], setting).catch(() => {
                        /* error */
                      });
                    }
                  })
                  .catch(() => {
                    /* error */
                  });

                return actions.setBadgeText(tabId, 0);
              }

              injectContentScript(tabId)
                .then(result => {
                  console.log('[Background] Content script ready, result:', result);
                  return setupPage(tabId, url, notes, setting);
                })
                .catch(error => {
                  console.error('[Background] Failed to inject or setup content script:', error);
                });
            });
          })
          .catch(() => {
            // error handling can be added if needed
          });
      }
    });
  };

  // タブが更新された時に呼ばれる
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const { status } = changeInfo;
    const { url } = tab;
    if (url === undefined) return;

    if (status === 'loading') {
      // ページ遷移開始時: URLをリセットして処理開始
      lastSetupUrl.set(tabId, url);
      setupTabNotes(tabId, url);
    } else if (status === 'complete') {
      // ページ読み込み完了時: URLが変わっていた場合（リダイレクト等）のみ再処理
      if (lastSetupUrl.get(tabId) !== url) {
        lastSetupUrl.set(tabId, url);
        setupTabNotes(tabId, url);
      }
    }
  });

  // タブが切り替わるたびに呼ばれる
  chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
    if (cache.badge[activeInfo.tabId] !== undefined) {
      actions.setBadgeText(activeInfo.tabId, cache.badge[activeInfo.tabId]);
    } else {
      actions.setBadgeText(activeInfo.tabId, '');
    }
  });

  // タブが閉じられた時に呼ばれる
  chrome.tabs.onRemoved.addListener(tabId => {
    delete cache.badge[tabId];
    lastSetupUrl.delete(tabId);
  });

  chrome.runtime.onMessage.addListener(handleMessages);
});
