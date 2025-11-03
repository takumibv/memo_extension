import { SIconButtonWrap, SIconButton, SCopySuccessIcon } from './StickyNote.style.js';
import { ColorPicker } from '@extension/shared/lib/components/ColorPicker/index.js';
import { PinIcon, CopyIcon, PalletIcon } from '@extension/shared/lib/components/Icon.js';
import { useClipboard } from '@extension/shared/lib/hooks/useClipboard.js';
import { msg } from '@extension/shared/lib/utils/utils.js';
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
      if (confirm(`"${title || msg('note')}" ${msg('confirm_remove_next_note_msg')}`)) {
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
        <Tooltip title={msg('switch_pin_msg')} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickFixedButton} isFocus={!is_fixed}>
              <PinIcon fill={is_fixed ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 1)'} />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={msg('edit_msg')} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={() => setIsEditing(true)}>
              <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={isSuccessCopy ? msg('copied_msg') : msg('copy_msg')} enterDelay={300}>
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
        <Tooltip title={msg('color_msg')} enterDelay={300}>
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
        <Tooltip title={msg('delete_msg')} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickDeleteButton}>
              <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        {!title && (
          <Tooltip title={msg('minimize_msg')} enterDelay={300}>
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
