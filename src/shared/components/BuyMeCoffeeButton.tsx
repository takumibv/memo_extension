import { EXTERNAL_LINKS, openExternalLink } from '@/shared/constants/links';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';

type Size = 'sm' | 'md';

const sizeClasses: Record<Size, { padding: string; icon: string }> = {
  sm: { padding: 'px-3 py-2', icon: 'h-4 w-4' },
  md: { padding: 'px-5 py-2.5', icon: 'h-5 w-5' },
};

type Props = {
  label: string;
  size?: Size;
  fullWidth?: boolean;
  asButton?: boolean;
  onClick?: () => void;
};

export const BuyMeCoffeeButton = ({ label, size = 'md', fullWidth = false, asButton = false, onClick }: Props) => {
  const { padding, icon } = sizeClasses[size];
  const className = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFDD00] text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#FFCA00]',
    padding,
    fullWidth && 'w-full',
  );

  if (asButton) {
    return (
      <button
        type="button"
        onClick={() => {
          openExternalLink(EXTERNAL_LINKS.buyMeACoffee);
          onClick?.();
        }}
        className={className}>
        <Coffee className={icon} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <a href={EXTERNAL_LINKS.buyMeACoffee} target="_blank" rel="noopener noreferrer" className={className}>
      <Coffee className={icon} />
      <span>{label}</span>
    </a>
  );
};
