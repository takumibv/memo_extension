import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';

type Tab = 'memos' | 'settings';

type Props = {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const OptionsHeader = ({ currentTab, onTabChange }: Props) => (
  <header className="sticky top-0 z-10 flex h-11 items-center border-b border-gray-200 bg-white px-6">
    <div className="flex items-center gap-2">
      <img src="/icon-34.png" alt="logo" className="h-6 w-6" />
      <span className="text-sm font-semibold text-gray-800">{t(I18N.APP_NAME)}</span>
    </div>
    <nav className="ml-8 flex gap-1">
      {(
        [
          ['memos', I18N.NOTE_HEADER],
          ['settings', I18N.SETTINGS_HEADER],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key as Tab)}
          className={`px-4 py-2 text-sm transition-colors ${
            currentTab === key
              ? 'border-b-2 border-gray-900 font-semibold text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}>
          {t(label)}
        </button>
      ))}
    </nav>
  </header>
);

export default OptionsHeader;
