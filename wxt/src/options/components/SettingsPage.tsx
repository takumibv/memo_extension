import Usage from '@/options/components/Usage';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { HiArrowDownTray } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { Setting } from '@/shared/types/Setting';

type Props = {
  notes: Note[];
  pageInfos: PageInfo[];
  setting: Setting;
  onUpdateDefaultColor: (color: string) => Promise<void>;
};

const SettingsPage = ({ notes, pageInfos, setting, onUpdateDefaultColor }: Props) => {
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

  const isInit = window.location.hash === '#init';

  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Default color */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">{t(I18N.DEFAULT_COLOR)}</h2>
        <p className="mb-4 text-sm text-gray-500">{t(I18N.DEFAULT_COLOR_DESCRIPTION)}</p>
        <ColorPicker color={setting.default_color} onChangeColor={onUpdateDefaultColor} />
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
            <HiArrowDownTray className="h-4 w-4" />
            {t(I18N.CSV_DOWNLOAD)}
          </button>
          <button
            type="button"
            onClick={handleTextDownload}
            disabled={notes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <HiArrowDownTray className="h-4 w-4" />
            {t(I18N.TEXT_DOWNLOAD)}
          </button>
        </div>
      </section>

      {/* Usage */}
      <section className="mb-8">
        <Usage isInit={isInit} />
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
            className="text-orange-500 hover:underline">
            @takumi_bv
          </a>
        </p>
      </section>
    </div>
  );
};

export default SettingsPage;
