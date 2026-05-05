import Usage from '@/options/components/Usage';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { getAllStorage, setStorage, removeStorage } from '@/shared/storages/common';
import { splitShortcut } from '@/shared/utils/shortcut';
import { useEffect, useRef, useState } from 'react';
import {
  Coffee,
  Download,
  Upload,
  SquareDashedMousePointer,
  TriangleAlert,
  Monitor,
  Search,
  Keyboard,
  ExternalLink,
} from 'lucide-react';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { Setting } from '@/shared/types/Setting';

type Props = {
  notes: Note[];
  pageInfos: PageInfo[];
  setting: Setting;
  onUpdateDefaultColor: (color: string) => Promise<void>;
  onNavigateToMemos?: () => void;
};

type ImportMode = 'overwrite' | 'merge';

/**
 * Options 画面に表示するコマンドラベルの i18n キーマップ。
 * 新しいコマンドを manifest に追加したらここに追記する。
 * 一覧に無いコマンド (例: wxt 開発時の reload-extension) は表示しない。
 */
const COMMAND_LABEL_KEYS: Record<string, string> = {
  'create-note': 'shortcut_command_create_note_msg',
};

const SettingsPage = ({ notes, pageInfos, setting, onUpdateDefaultColor, onNavigateToMemos }: Props) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [shortcutCommands, setShortcutCommands] = useState<chrome.commands.Command[]>([]);
  const pendingFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // chrome://extensions/shortcuts から戻ったときに最新の割り当てを反映するため、
  // マウント時 + ウィンドウフォーカス時に再取得する
  useEffect(() => {
    const refresh = () => {
      chrome.commands.getAll(commands => {
        const next = commands.filter(c => c.name !== undefined && c.name in COMMAND_LABEL_KEYS);
        setShortcutCommands(prev => {
          const unchanged =
            prev.length === next.length &&
            prev.every((p, i) => p.name === next[i]?.name && p.shortcut === next[i]?.shortcut);
          return unchanged ? prev : next;
        });
      });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const handleDownload = (content: string, contentType: string, fileType: string) => {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const fileName = `export_NoteEverywhere_${dateStr}.${fileType}`;
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvDownload = () => {
    const header = 'id,title,description,url\n';
    const rows = notes
      .map(note => {
        const pi = pageInfos.find(p => p.id === note.page_info_id);
        const escapeCsv = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
        return `${note.id},${escapeCsv(note.title || '')},${escapeCsv(note.description || '')},${escapeCsv(pi?.page_url || '')}`;
      })
      .join('\n');
    handleDownload(header + rows, 'text/csv;charset=utf-8;', 'csv');
  };

  const handleTextDownload = () => {
    const text = notes
      .map(note => {
        const pi = pageInfos.find(p => p.id === note.page_info_id);
        return [
          `id: ${note.id}`,
          `title: ${note.title || ''}`,
          `page: ${pi?.page_url || ''}`,
          `content: ${note.description || ''}`,
          '----',
        ].join('\n');
      })
      .join('\n');
    handleDownload(text, 'text/plain;charset=utf-8;', 'txt');
  };

  const handleDataExport = async () => {
    const allData = await getAllStorage();
    const json = JSON.stringify(allData, null, 2);
    handleDownload(json, 'application/json;charset=utf-8;', 'json');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseImportFile = async (file: File): Promise<Record<string, unknown>> => {
    const text = await file.text();
    const data: unknown = JSON.parse(text);

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('Invalid format');
    }

    const record = data as Record<string, unknown>;

    // Validate: at least one note_xxx key must exist
    const hasNotes = Object.keys(record).some(key => /^note_\d+$/.test(key));
    if (!hasNotes) {
      throw new Error('No notes found');
    }

    return record;
  };

  const hasExistingNotes = notes.length > 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be selected again
    e.target.value = '';

    // Validate file before showing dialog
    try {
      await parseImportFile(file);
    } catch {
      alert(t('import_error_msg'));
      return;
    }

    if (hasExistingNotes) {
      pendingFileRef.current = file;
      setShowImportDialog(true);
    } else {
      await executeImport(file, 'overwrite');
    }
  };

  const handleImportConfirm = async (mode: ImportMode) => {
    setShowImportDialog(false);
    const file = pendingFileRef.current;
    if (!file) return;
    pendingFileRef.current = null;
    await executeImport(file, mode);
  };

  const executeImport = async (file: File, mode: ImportMode) => {
    try {
      const data = await parseImportFile(file);

      if (mode === 'overwrite') {
        const existingData = await getAllStorage();
        for (const key of Object.keys(existingData)) {
          await removeStorage(key);
        }
        for (const [key, value] of Object.entries(data)) {
          await setStorage(key, value);
        }
      } else {
        const existingData = await getAllStorage();

        // Merge note_page_index
        const existingIndex = (existingData['note_page_index'] || {}) as Record<string, number[]>;
        const importIndex = (data['note_page_index'] || {}) as Record<string, number[]>;
        const mergedIndex: Record<string, number[]> = { ...existingIndex };
        for (const [pageId, noteIds] of Object.entries(importIndex)) {
          const existing = mergedIndex[pageId] || [];
          const merged = [...new Set([...existing, ...noteIds])];
          mergedIndex[pageId] = merged;
        }

        // Merge page_info array
        const existingPageInfos = (existingData['page_info'] || []) as { id?: number }[];
        const importPageInfos = (data['page_info'] || []) as { id?: number }[];
        const existingPageIds = new Set(existingPageInfos.map(p => p.id));
        const mergedPageInfos = [...existingPageInfos, ...importPageInfos.filter(p => !existingPageIds.has(p.id))];

        // Write individual entries (skip index and page_info, handled separately)
        // For note entries, keep the one with the newer updated_at
        for (const [key, value] of Object.entries(data)) {
          if (key === 'note_page_index' || key === 'page_info') continue;

          if (/^note_\d+$/.test(key) && key in existingData) {
            const existingNote = existingData[key] as Note;
            const importNote = value as Note;
            const existingDate = existingNote.updated_at ? new Date(existingNote.updated_at).getTime() : 0;
            const importDate = importNote.updated_at ? new Date(importNote.updated_at).getTime() : 0;
            if (existingDate >= importDate) continue;
          }

          await setStorage(key, value);
        }

        await setStorage('note_page_index', mergedIndex);
        await setStorage('page_info', mergedPageInfos);
      }

      alert(t('import_success_msg'));
      window.location.reload();
    } catch {
      alert(t('import_error_msg'));
    }
  };

  const handleImportCancel = () => {
    setShowImportDialog(false);
    pendingFileRef.current = null;
  };

  const isInit = window.location.hash === '#init';

  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Default color */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t(I18N.DEFAULT_COLOR)}</h2>
        <p className="mb-4 text-sm text-gray-500">{t(I18N.DEFAULT_COLOR_DESCRIPTION)}</p>
        <ColorPicker color={setting.default_color} onChangeColor={onUpdateDefaultColor} />
      </section>

      {/* Keyboard shortcuts */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t('shortcut_section_title_msg')}</h2>
        <p className="mb-4 text-sm text-gray-500">{t('shortcut_section_description_msg')}</p>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h3 className="text-sm font-medium text-gray-700">{t('shortcut_current_assignment_msg')}</h3>
            <button
              type="button"
              onClick={() => {
                chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }).catch(() => {});
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
              <Keyboard className="h-3.5 w-3.5" />
              {t('shortcut_open_chrome_settings_msg')}
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </button>
          </div>
          <ul className="divide-y divide-gray-200">
            {shortcutCommands.map(cmd => (
              <li key={cmd.name} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <span className="text-gray-700">{t(COMMAND_LABEL_KEYS[cmd.name!]!)}</span>
                {cmd.shortcut ? (
                  <kbd className="inline-flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-sans text-xs text-gray-800">
                    {splitShortcut(cmd.shortcut).map((token, i) => (
                      <span key={i}>{token}</span>
                    ))}
                  </kbd>
                ) : (
                  <span className="text-xs text-gray-400">{t('shortcut_not_set_msg')}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-400">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          {t('shortcut_reserved_keys_notice_msg')}
        </p>
      </section>

      {/* Usage */}
      <section className="mb-8">
        <Usage isInit={isInit} onNavigateToMemos={onNavigateToMemos} />
      </section>

      {/* New Feature: Pin to Element */}
      <section className="mb-8">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 p-1.5">
              <SquareDashedMousePointer className="h-5 w-5 text-emerald-600" />
            </span>
            <div>
              <span className="mr-2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                New
              </span>
              <span className="text-lg font-semibold text-gray-800">{t('feature_pin_to_element_title')}</span>
            </div>
          </div>
          <p className="mb-5 text-sm text-gray-700">{t('feature_pin_to_element_intro')}</p>

          <img
            src="/images/usage/element_picker_usage01.png"
            alt=""
            className="mb-5 w-full max-w-md rounded-lg border border-emerald-200"
          />

          <ul className="mb-5 space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{t('feature_pin_to_element_benefit1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{t('feature_pin_to_element_benefit2')}</span>
            </li>
          </ul>

          <div className="space-y-2 rounded-md bg-white/70 p-3">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{t('feature_pin_to_element_note1')}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{t('feature_pin_to_element_note2')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t(I18N.EXPORT)}</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCsvDownload}
            disabled={notes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <Download className="h-4 w-4" />
            {t(I18N.CSV_DOWNLOAD)}
          </button>
          <button
            type="button"
            onClick={handleTextDownload}
            disabled={notes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <Download className="h-4 w-4" />
            {t(I18N.TEXT_DOWNLOAD)}
          </button>
        </div>
      </section>

      {/* Data Transfer */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t('data_transfer_msg')}</h2>
        <p className="mb-3 text-xs text-gray-400">{t('export_not_importable_msg')}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDataExport}
            disabled={notes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <Download className="h-4 w-4" />
            {t('data_export_msg')}
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            {t('data_import_msg')}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
        </div>
      </section>

      {/* Import mode dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-gray-800">{t('import_confirm_title_msg')}</h3>
            <div className="flex flex-col gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => handleImportConfirm('overwrite')}
                  className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                  {t('import_mode_overwrite_msg')}
                </button>
                <p className="mt-1 text-xs text-gray-400">{t('import_overwrite_note_msg')}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleImportConfirm('merge')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {t('import_mode_merge_msg')}
                </button>
                <p className="mt-1 text-xs text-gray-400">{t('import_merge_note_msg')}</p>
              </div>
              <button
                type="button"
                onClick={handleImportCancel}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                {t(I18N.CANCEL)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t('support_this_extension')}</h2>
        <p className="mb-3 text-sm text-gray-500">{t('support_description')}</p>
        <a
          href="https://buymeacoffee.com/takumibv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFDD00] px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#FFCA00]">
          <Coffee className="h-5 w-5" />
          <span>Buy me a coffee</span>
        </a>
      </section>

      {/* Maker */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t(I18N.SETTING_ABOUT_THIS_APP)}</h2>
        <p className="text-sm text-gray-600">
          {t(I18N.SETTING_ABOUT_THIS_APP_CREATED_BY)}:{' '}
          <a
            href="https://x.com/takumi_bv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline">
            @takumi_bv
          </a>
        </p>
      </section>
    </div>
  );
};

export default SettingsPage;
