import { SIconButtonWrap, SIconButton, SCopySuccessIcon } from './StickyNote.style';
import { t } from '@extension/i18n';
import { ColorPicker } from '@extension/shared/lib/components/ColorPicker';
import { PinIcon, CopyIcon, PalletIcon } from '@extension/shared/lib/components/Icon';
import { useClipboard } from '@extension/shared/lib/hooks/useClipboard';
import { I18N } from '@extension/shared/lib/i18n/keys';
import { MinusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { memo, useState } from 'react';
import type React from 'react';

type Props = {
  title?: string;
  description?: string;
  is_fixed?: boolean;
  color?: string;
  setIsEditing: (isEditing: boolean) => void;
  onClickFixedButton: () => void;
  onChangeColor: (color: string) => void;
  onDeleteNote: () => void;
  onCloseNote: () => void;
};

/**
 * メモの付箋のアクション
 */
const StickyNoteActions: React.FC<Props> = memo(
  ({
    title = '',
    description = '',
    is_fixed,
    color,
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

    // カラーピッカー
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const onClickColorPickerButton = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseColorPicker = () => {
      setAnchorEl(null);
    };
    const isOpenColorPickerPopover = Boolean(anchorEl);
    const popoverId = isOpenColorPickerPopover ? 'color-picker-popover' : undefined;

    return (
      <>
        <Tooltip title={t(I18N.SWITCH_PIN)} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickFixedButton} isFocus={!is_fixed}>
              <PinIcon fill={is_fixed ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 1)'} />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={t(I18N.EDIT)} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={() => setIsEditing(true)}>
              <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={isSuccessCopy ? t(I18N.COPIED) : t(I18N.COPY)} enterDelay={300}>
          <SIconButtonWrap>
            {isSuccessCopy ? (
              <SCopySuccessIcon fill="#22c55e" />
            ) : (
              <SIconButton onClick={() => copyClipboard(`${title}\n${description}`)}>
                <CopyIcon fill="rgba(0, 0, 0, 0.4)" />
              </SIconButton>
            )}
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={t(I18N.COLOR)} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickColorPickerButton}>
              <PalletIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Popover
          id={popoverId}
          open={isOpenColorPickerPopover}
          anchorEl={anchorEl}
          onClose={handleCloseColorPicker}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}>
          <div style={{ width: '168px', textAlign: 'center' }}>
            <ColorPicker hasDefault color={color} onChangeColor={onChangeColor} />
          </div>
        </Popover>
        <Tooltip title={t(I18N.DELETE)} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickDeleteButton}>
              <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        {!title && (
          <Tooltip title={t(I18N.MINIMIZE)} enterDelay={300}>
            <SIconButtonWrap>
              <SIconButton onClick={onCloseNote}>
                <MinusIcon fill="rgba(0, 0, 0, 0.4)" />
              </SIconButton>
            </SIconButtonWrap>
          </Tooltip>
        )}
      </>
    );
  },
);

StickyNoteActions.displayName = 'StickyNoteActions';

export default StickyNoteActions;
