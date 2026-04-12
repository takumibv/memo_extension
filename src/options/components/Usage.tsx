import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Props = {
  isInit?: boolean;
  onNavigateToMemos?: () => void;
};

const UsageStep = ({ text, image, imageWidth }: { text: string; image?: string; imageWidth?: string }) => (
  <div className="mb-4">
    <p className="mb-2 text-sm text-gray-700">{text}</p>
    {image && <img src={image} alt="" width={imageWidth} className="mx-auto mt-1 max-w-md" />}
  </div>
);

const Usage = ({ isInit = false, onNavigateToMemos }: Props) => {
  const [isOpen, setIsOpen] = useState(isInit);

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${isInit ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-full items-center justify-between p-6 text-left">
        <h2 className="text-lg font-semibold text-gray-800">{t(I18N.HOW_TO_USE_HEADER)}</h2>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          {isInit && <p className="mb-6 text-sm font-medium text-gray-900">{t(I18N.WELCOME)}</p>}

          <div className="space-y-6">
            <UsageStep text={t(I18N.USAGE01)} image="/images/usage/usage01.png" imageWidth="400px" />
            <UsageStep text={t(I18N.USAGE02)} image="/images/usage/usage02.png" imageWidth="400px" />
            <UsageStep text={t(I18N.USAGE02_2)} image="/images/usage/usage02_2.png" imageWidth="200px" />
            <UsageStep text={t(I18N.USAGE03)} image="/images/usage/usage03.png" />
            <UsageStep text={t(I18N.USAGE04)} />
            <UsageStep text={t(I18N.USAGE05)} image="/images/usage/usage05.png" imageWidth="400px" />
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
              <img src="/images/usage/usage06.png" width="300px" alt="" className="mx-auto mt-1 max-w-md" />
            </div>

            {/* Feature list */}
            <div>
              <p className="mb-3 text-sm text-gray-700">{t(I18N.USAGE07)}</p>
              <ul className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                <li>
                  {t(I18N.PIN)} - {t(I18N.PIN_EXPLAIN)}
                </li>
                <li>
                  {t(I18N.EDIT)} - {t(I18N.EDIT_EXPLAIN)}
                </li>
                <li>
                  {t(I18N.COPY)} - {t(I18N.COPY_EXPLAIN)}
                </li>
                <li>
                  {t(I18N.COLOR)} - {t(I18N.COLOR_EXPLAIN)}
                </li>
                <li>
                  {t(I18N.DELETE)} - {t(I18N.DELETE_EXPLAIN)}
                </li>
                <li>
                  {t(I18N.OPEN)} - {t(I18N.OPEN_EXPLAIN)}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usage;
