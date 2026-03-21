import { ColorPicker } from '@/shared/components/ColorPicker';
import { PinIcon, CopyIcon, PalletIcon, CopySuccessIcon } from '@/shared/components/Icon';
import { useClipboard } from '@/shared/hooks/useClipboard';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { memo, useState, useRef, useEffect } from 'react';
import { HiMinus, HiPencilSquare, HiTrash } from 'react-icons/hi2';

type Props = {
  title?: string;
  description?: string;
  is_fixed?: boolean;
  color?: string;
  iconColor?: string;
  activeIconColor?: string;
  setIsEditing: (isEditing: boolean) => void;
  onClickFixedButton: () => void;
  onChangeColor: (color: string) => void;
  onDeleteNote: () => void;
  onCloseNote: () => void;
};

const StickyNoteActions: React.FC<Props> = memo(
  ({
    title = '',
    description = '',
    is_fixed,
    color,
    iconColor = 'rgba(0,0,0,0.4)',
    activeIconColor = 'rgba(0,0,0,1)',
    setIsEditing,
    onClickFixedButton,
    onChangeColor,
    onDeleteNote,
    onCloseNote,
  }) => {
    const { isSuccessCopy, copyClipboard } = useClipboard();

    const onClickDeleteButton = () => {
      if (confirm(`"${title || t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
        onDeleteNote();
      }
    };

    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!showColorPicker) return;

      const handleClickOutside = (e: Event) => {
        const path = e.composedPath();
        if (colorPickerRef.current && !path.includes(colorPickerRef.current)) {
          setShowColorPicker(false);
        }
      };
      window.addEventListener('pointerdown', handleClickOutside, true);
      return () => window.removeEventListener('pointerdown', handleClickOutside, true);
    }, [showColorPicker]);

    const iconBtnClass = 'pointer-events-auto flex h-5 w-5 items-center justify-center rounded hover:bg-black/10';
    const iconClass = 'h-5 w-5';

    return (
      <>
        <div className="flex items-center justify-center" title={t(I18N.SWITCH_PIN)}>
          <button
            onClick={onClickFixedButton}
            className={`${iconBtnClass} ${!is_fixed ? 'bg-black/10 shadow-[0_0_0_4px_rgba(0,0,0,0.1)]' : ''}`}>
            <PinIcon className={iconClass} fill={is_fixed ? iconColor : activeIconColor} />
          </button>
        </div>
        <div className="ml-3 flex items-center justify-center" title={t(I18N.EDIT)}>
          <button onClick={() => setIsEditing(true)} className={iconBtnClass}>
            <HiPencilSquare className={iconClass} style={{ color: iconColor }} />
          </button>
        </div>
        <div className="ml-3 flex items-center justify-center" title={isSuccessCopy ? t(I18N.COPIED) : t(I18N.COPY)}>
          {isSuccessCopy ? (
            <CopySuccessIcon className={iconClass} fill="#22c55e" />
          ) : (
            <button onClick={() => copyClipboard(`${title}\n${description}`)} className={iconBtnClass}>
              <CopyIcon className={iconClass} fill={iconColor} />
            </button>
          )}
        </div>
        <div className="relative ml-3 flex items-center justify-center" ref={colorPickerRef} title={t(I18N.COLOR)}>
          <button onClick={() => setShowColorPicker(!showColorPicker)} className={iconBtnClass}>
            <PalletIcon className={iconClass} fill={iconColor} />
          </button>
          {showColorPicker && (
            <div className="pointer-events-auto absolute left-0 top-full z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white text-center shadow-lg">
              <ColorPicker
                hasDefault
                color={color}
                onChangeColor={c => {
                  onChangeColor(c);
                  setShowColorPicker(false);
                }}
              />
            </div>
          )}
        </div>
        <div className="ml-3 flex items-center justify-center" title={t(I18N.DELETE)}>
          <button onClick={onClickDeleteButton} className={iconBtnClass}>
            <HiTrash className={iconClass} style={{ color: iconColor }} />
          </button>
        </div>
        {!title && (
          <div className="ml-3 flex items-center justify-center" title={t(I18N.MINIMIZE)}>
            <button onClick={onCloseNote} className={iconBtnClass}>
              <HiMinus className={iconClass} style={{ color: iconColor }} />
            </button>
          </div>
        )}
      </>
    );
  },
);

StickyNoteActions.displayName = 'StickyNoteActions';

export default StickyNoteActions;
