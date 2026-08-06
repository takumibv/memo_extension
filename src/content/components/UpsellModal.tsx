import { EXTERNAL_LINKS, openExternalLink } from '@/shared/constants/links';
import { t } from '@/shared/i18n/i18n';
import { X, Lock } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

const UpsellModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={t('upsell_close_button_msg')}>
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
          <Lock className="h-5 w-5 text-amber-600" />
        </div>

        <h2 className="mb-2 text-base font-semibold text-gray-900">{t('upsell_trial_limit_title_msg')}</h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-500">{t('upsell_trial_limit_body_msg')}</p>
        <p className="mb-5 text-xs leading-relaxed text-gray-400">{t('upsell_activate_hint_msg')}</p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openExternalLink(EXTERNAL_LINKS.purchaseLicense)}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            {t('upsell_buy_button_msg')}
          </button>
          <button type="button" onClick={onClose} className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50">
            {t('upsell_close_button_msg')}
          </button>
        </div>
      </div>
    </div>
  );
};

UpsellModal.displayName = 'UpsellModal';

export default UpsellModal;
