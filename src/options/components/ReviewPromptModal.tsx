import { BuyMeCoffeeButton } from '@/shared/components/BuyMeCoffeeButton';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/ui/Dialog';
import { EXTERNAL_LINKS, openExternalLink } from '@/shared/constants/links';
import { t } from '@/shared/i18n/i18n';
import { markDismissed, markSnoozed, SNOOZE_DURATION_DAYS } from '@/shared/storages/reviewPromptStorage';
import { Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ReviewPromptModal = ({ open, onOpenChange }: Props) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [reviewedThisSession, setReviewedThisSession] = useState(false);
  const [donatedThisSession, setDonatedThisSession] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when modal reopens
      setDontShowAgain(false);
      setReviewedThisSession(false);
      setDonatedThisSession(false);
    }
  }, [open]);

  const handleReview = () => {
    openExternalLink(EXTERNAL_LINKS.chromeWebStoreReview);
    setReviewedThisSession(true);
    setDontShowAgain(true);
  };

  const handleCoffeeClick = () => {
    setDonatedThisSession(true);
    setDontShowAgain(true);
  };

  const handleClose = async () => {
    try {
      if (dontShowAgain) {
        await markDismissed();
      } else {
        await markSnoozed(SNOOZE_DURATION_DAYS);
      }
    } catch (err) {
      console.error('[ReviewPromptModal] Failed to persist state:', err);
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) void handleClose();
      }}>
      <DialogContent
        className="relative max-w-sm bg-white p-6"
        onPointerDownOutside={e => e.preventDefault()}
        onInteractOutside={e => e.preventDefault()}>
        <button
          type="button"
          onClick={() => void handleClose()}
          className="absolute right-2 top-2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
          <Star className="h-5 w-5 text-indigo-600" />
        </div>

        <DialogTitle className="mb-2 text-base font-semibold text-gray-900">{t('review_prompt_title')}</DialogTitle>
        <DialogDescription className="mb-4 text-sm leading-relaxed text-gray-500">
          {t('review_prompt_description')}
        </DialogDescription>

        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleReview}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            {t('review_prompt_button_review')}
          </button>
          {reviewedThisSession && <p className="text-xs text-gray-500">{t('review_prompt_thanks_review')}</p>}

          <BuyMeCoffeeButton
            label={t('review_prompt_button_coffee')}
            size="sm"
            fullWidth
            asButton
            onClick={handleCoffeeClick}
          />
          {donatedThisSession && <p className="text-xs text-gray-500">{t('review_prompt_thanks_coffee')}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-indigo-600"
            />
            {t('review_prompt_dont_show_again')}
          </label>
          <button
            type="button"
            onClick={() => void handleClose()}
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50">
            {t('review_prompt_button_later')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPromptModal;
