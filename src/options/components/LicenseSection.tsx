import { sendActivateLicense, sendFetchLicenseStatus } from '@/message/sender/options';
import { EXTERNAL_LINKS, openExternalLink } from '@/shared/constants/links';
import { t } from '@/shared/i18n/i18n';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { LicenseStatusView } from '@/shared/types/License';

type Feedback = { type: 'success' | 'error'; message: string };

const LicenseSection = () => {
  const [status, setStatus] = useState<LicenseStatusView>();
  const [code, setCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>();

  useEffect(() => {
    sendFetchLicenseStatus()
      .then(res => setStatus(res.status))
      .catch(err => console.error('[LicenseSection] Failed to fetch license status:', err));
  }, []);

  const handleActivate = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setActivating(true);
    setFeedback(undefined);
    try {
      const res = await sendActivateLicense(trimmed);
      setStatus(res.status);
      if (res.ok) {
        setFeedback({ type: 'success', message: t('license_activate_success_msg') });
        setCode('');
      } else {
        setFeedback({ type: 'error', message: t('license_activate_error_msg') });
      }
    } catch {
      setFeedback({ type: 'error', message: t('license_activate_error_msg') });
    } finally {
      setActivating(false);
    }
  };

  if (!status) return null;

  return (
    <div className="mt-5 rounded-md bg-white/70 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">{t('license_section_title_msg')}</h3>

      {status.licensed ? (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {t('license_status_licensed_msg')}
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-600">
            {t('license_trial_remaining_label_msg')}:{' '}
            <strong>
              {status.trialRemaining} / {status.trialLimit}
            </strong>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={t('license_input_placeholder_msg')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void handleActivate()}
              disabled={activating || !code.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {t('license_activate_button_msg')}
            </button>
          </div>
          {feedback && (
            <p className={`mt-2 text-xs ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {feedback.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => openExternalLink(EXTERNAL_LINKS.purchaseLicense)}
            className="mt-3 text-xs font-medium text-indigo-600 hover:underline">
            {t('upsell_buy_button_msg')}
          </button>
        </>
      )}
    </div>
  );
};

export default LicenseSection;
