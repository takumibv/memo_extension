import { ColorPicker } from '@/shared/components/ColorPicker';
import { PinIcon, CopyIcon, PalletIcon, CopySuccessIcon } from '@/shared/components/Icon';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/Popover';
import { useClipboard } from '@/shared/hooks/useClipboard';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { memo, useState } from 'react';
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
  portalContainer?: HTMLElement;
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
    portalContainer,
  }) => {
    const { isSuccessCopy, copyClipboard } = useClipboard();
    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const onClickDeleteButton = () => {
      if (confirm(`"${title || t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
        onDeleteNote();
      }
    };

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
        <div className="ml-3 flex items-center justify-center" title={t(I18N.COLOR)}>
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <button className={iconBtnClass}>
                <PalletIcon className={iconClass} fill={iconColor} />
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="pointer-events-auto" container={portalContainer}>
              <ColorPicker
                hasDefault
                color={color}
                onChangeColor={c => {
                  onChangeColor(c);
                  setColorPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
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
