import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';

type Props = {
  isInit?: boolean;
  onNavigateToMemos?: () => void;
};

const UsageStep = ({ text, image }: { text: string; image?: string }) => (
  <div>
    <p className="mb-2 text-sm text-gray-700">{text}</p>
    {image && <img src={image} alt="" className="w-full max-w-md rounded-lg border border-gray-200" />}
  </div>
);

const Usage = ({ isInit = false, onNavigateToMemos }: Props) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white p-6 ${isInit ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}>
    <h2 className="mb-4 text-lg font-semibold text-gray-800">{t(I18N.HOW_TO_USE_HEADER)}</h2>

    {isInit && <p className="mb-6 text-sm font-medium text-gray-900">{t(I18N.WELCOME)}</p>}

    <div className="space-y-6">
      <UsageStep text={t(I18N.USAGE01)} image="/images/usage/usage01.png" />
      <UsageStep text={t(I18N.USAGE02)} image="/images/usage/usage02.png" />
      <UsageStep text={t(I18N.USAGE02_2)} image="/images/usage/usage02_2.png" />
      <UsageStep text={t(I18N.USAGE03)} image="/images/usage/usage03.png" />
      <UsageStep text={t(I18N.USAGE04)} />
      <UsageStep text={t(I18N.USAGE05)} image="/images/usage/usage05.png" />
      <div>
        <p className="mb-2 text-sm text-gray-700">
          <button
            type="button"
            onClick={() => {
              onNavigateToMemos?.();
            }}
            className="text-blue-500 hover:underline">
            {t(I18N.USAGE06)}
          </button>
          {t(I18N.USAGE06_2)}
        </p>
        <img src="/images/usage/usage06.png" alt="" className="w-full max-w-md rounded-lg border border-gray-200" />
      </div>

      {/* Feature list */}
      <div>
        <p className="mb-3 text-sm text-gray-700">{t(I18N.USAGE07)}</p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            🔒 {t(I18N.PIN)} - {t(I18N.PIN_EXPLAIN)}
          </li>
          <li>
            ✏️ {t(I18N.EDIT)} - {t(I18N.EDIT_EXPLAIN)}
          </li>
          <li>
            📋 {t(I18N.COPY)} - {t(I18N.COPY_EXPLAIN)}
          </li>
          <li>
            🎨 {t(I18N.COLOR)} - {t(I18N.COLOR_EXPLAIN)}
          </li>
          <li>
            🗑️ {t(I18N.DELETE)} - {t(I18N.DELETE_EXPLAIN)}
          </li>
          <li>
            📦 {t(I18N.OPEN)} - {t(I18N.OPEN_EXPLAIN)}
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default Usage;
