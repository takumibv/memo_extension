import React from "react";
import { memo } from "react";
import Tooltip from "@mui/material/Tooltip";
import { CopyIcon, PalletIcon, PinIcon } from "../Icon";
import { MinusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { SIconButtonWrap, SIconButton, SCopySuccessIcon } from "./StickyNote.style";
import { msg } from "../../utils";
import { useClipboard } from "../../hooks/useClipboard";
import Popover from "@mui/material/Popover";
import ColorPicker from "../ColorPicker/ColorPicker";

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
 * メモの付箋
 */
const StickyNoteActions: React.FC<Props> = memo(
  ({
    title = "",
    description = "",
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
      if (confirm(`"${title || msg("note")}" ${msg("confirm_remove_next_note_msg")}`)) {
        onDeleteNote();
      }
    };

    // カラーピッカー
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const onClickColorPickerButton = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseColorPicker = () => {
      setAnchorEl(null);
    };
    const isOpenColorPickerPopover = Boolean(anchorEl);
    const popoverId = isOpenColorPickerPopover ? "color-picker-popover" : undefined;

    return (
      <>
        <Tooltip title={msg("switch_pin_msg")} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickFixedButton} isFocus={!is_fixed}>
              <PinIcon fill={is_fixed ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 1)"} />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={msg("edit_msg")} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={() => setIsEditing(true)}>
              <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        <Tooltip title={isSuccessCopy ? msg("copied_msg") : msg("copy_msg")} enterDelay={300}>
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
        <Tooltip title={msg("color_msg")} enterDelay={300}>
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
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <div style={{ width: "168px", textAlign: "center" }}>
            <ColorPicker hasDefault color={color} onChangeColor={onChangeColor} />
          </div>
        </Popover>
        <Tooltip title={msg("delete_msg")} enterDelay={300}>
          <SIconButtonWrap>
            <SIconButton onClick={onClickDeleteButton}>
              <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
            </SIconButton>
          </SIconButtonWrap>
        </Tooltip>
        {!title && (
          <Tooltip title={msg("minimize_msg")} enterDelay={300}>
            <SIconButtonWrap>
              <SIconButton onClick={onCloseNote}>
                <MinusIcon fill="rgba(0, 0, 0, 0.4)" />
              </SIconButton>
            </SIconButtonWrap>
          </Tooltip>
        )}
      </>
    );
  }
);

export default StickyNoteActions;
