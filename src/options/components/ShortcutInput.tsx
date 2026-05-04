import { eventToShortcut, formatShortcut } from '@/shared/shortcut';
import { t } from '@/shared/i18n/i18n';
import { useState } from 'react';

type Props = {
  value: string;
  onChange: (shortcut: string) => void;
};

const ShortcutInput = ({ value, onChange }: Props) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isRecording) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent.isComposing) return;

    // Esc cancels recording without saving
    if (e.key === 'Escape') {
      setIsRecording(false);
      return;
    }

    const shortcut = eventToShortcut(e.nativeEvent);
    if (!shortcut) return; // pure modifier press, keep listening

    // 修飾キーなしの Tab/Backspace/Enter/Space は誤発火を招きやすいので録音せずに継続
    const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
    const SOLO_DISALLOWED = new Set(['Tab', 'Backspace', 'Enter', 'Space', 'Delete']);
    const mainKey = shortcut.split('+').at(-1) ?? '';
    if (!hasModifier && SOLO_DISALLOWED.has(mainKey)) return;

    onChange(shortcut);
    setIsRecording(false);
  };

  const handleClick = () => {
    if (!isRecording) setIsRecording(true);
  };

  const handleBlur = () => {
    setIsRecording(false);
  };

  const display = isRecording
    ? t('shortcut_recording_msg')
    : value
      ? formatShortcut(value)
      : t('shortcut_placeholder_msg');

  return (
    <div className="flex items-center gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`min-w-[180px] cursor-pointer select-none rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          isRecording
            ? 'border-blue-400 bg-blue-50 text-blue-700'
            : value
              ? 'border-gray-300 bg-white text-gray-800'
              : 'border-gray-300 bg-white text-gray-400'
        }`}>
        {display}
      </div>
      {value && !isRecording && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          {t('shortcut_clear_msg')}
        </button>
      )}
    </div>
  );
};

export default ShortcutInput;
