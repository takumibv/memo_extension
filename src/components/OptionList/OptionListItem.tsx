import React, { memo, useEffect, useState } from "react";
import { Note } from "../../types/Note";
import { formatDate } from "../../utils";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { CopyIcon, PalletIcon } from "../Icon";
import { PageInfo } from "../../types/PageInfo";
import { Popover, Tooltip } from "@mui/material";
import { useClipboard } from "../../hooks/useClipboard";
import { NoteEditModal } from "../NoteEditModal/NoteEditModal";
import {
  SCard,
  SCardHeader,
  SCardTitle,
  SCardDescription,
  SCardDescriptionText,
  SCardDate,
  SCardDateText,
  SCardFooter,
  SCardActions,
  SIconButtonWrap,
  SCopySuccessIcon,
  SIconButton,
  SPageInfoWrap,
  SPageInfo,
  SPageInfoHeader,
  SPageInfoFaviconImage,
  SPageInfoTitle,
  SPageInfoLink,
  SLaunchIcon,
} from "./OptionListItem.style";
import { msg } from "../../utils";
import ColorPicker from "../ColorPicker/ColorPicker";

type Props = {
  note: Note;
  defaultColor?: string;
  pageInfo?: PageInfo;
  showPageInfo?: boolean;
  onUpdate: (note: Note) => Promise<boolean>;
  onDelete: (note: Note) => Promise<boolean>;
  onClickLink: (url: string) => void;
  onClickFilter: (pageInfoId?: number) => void;
  measure?: () => void;
};

const OptionListItem: React.FC<Props> = memo(
  ({
    note,
    defaultColor,
    pageInfo,
    showPageInfo,
    onUpdate,
    onDelete,
    onClickLink,
    onClickFilter,
    measure,
  }) => {
    const { id, title, description, created_at, updated_at } = note;
    const [openModal, setOpenModal] = useState(false);
    const { isSuccessCopy, copyClipboard } = useClipboard();

    useEffect(() => {
      measure && measure();
    }, [note]);

    // カラーピッカー
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const onClickColorPickerButton = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };
    const handleCloseColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAnchorEl(null);
    };
    const isOpenColorPickerPopover = Boolean(anchorEl);
    const popoverId = isOpenColorPickerPopover ? "color-picker-popover" : undefined;
    const onChangeColor = (color: string) => {
      onUpdate({
        ...note,
        color,
      });
    };

    return (
      <>
        <SCard
          tabIndex={-1}
          onClick={() => {
            setOpenModal(true);
          }}
          style={{ backgroundColor: note.color || defaultColor || "#fff" }}
        >
          <SCardHeader>
            <SCardTitle>{title}</SCardTitle>
          </SCardHeader>
          <SCardDescription>
            <SCardDescriptionText>{description}</SCardDescriptionText>
          </SCardDescription>
          {showPageInfo && pageInfo && (
            <SPageInfoWrap>
              <SPageInfo
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickLink(pageInfo.page_url ?? "");
                }}
              >
                <SPageInfoHeader>
                  <SPageInfoFaviconImage src={pageInfo.fav_icon_url} />
                  <SPageInfoTitle>{pageInfo.page_title}</SPageInfoTitle>
                </SPageInfoHeader>
                <SPageInfoLink>{pageInfo.page_url}</SPageInfoLink>
              </SPageInfo>
              <Tooltip title={msg("this_page_note_list_msg")}>
                <SPageInfo
                  $isFilter
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickFilter(pageInfo.id);
                  }}
                >
                  <SLaunchIcon fill="rgba(0, 0, 0, 0.4)" />
                </SPageInfo>
              </Tooltip>
            </SPageInfoWrap>
          )}
          <SCardFooter>
            <SCardActions>
              <Tooltip title={msg("edit_msg")} enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModal(true);
                    }}
                  >
                    <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                </SIconButtonWrap>
              </Tooltip>
              <Tooltip title={isSuccessCopy ? msg("copied_msg") : msg("copy_msg")} enterDelay={300}>
                <SIconButtonWrap>
                  {isSuccessCopy ? (
                    <SCopySuccessIcon fill="#22c55e" />
                  ) : (
                    <SIconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        copyClipboard(`${title}\n${description}`);
                      }}
                    >
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
                <div style={{ width: "168px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                  <ColorPicker hasDefault color={note.color} onChangeColor={onChangeColor} />
                </div>
              </Popover>
              <Tooltip title={msg("delete_msg")} enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      id && onDelete(note);
                    }}
                  >
                    <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                </SIconButtonWrap>
              </Tooltip>
            </SCardActions>
            <SCardDate>
              {created_at && (
                <SCardDateText>
                  {msg("created_at_msg")}: {formatDate(new Date(created_at))}
                </SCardDateText>
              )}
              {updated_at && (
                <SCardDateText>
                  {msg("updated_at_msg")}: {formatDate(new Date(updated_at))}
                </SCardDateText>
              )}
            </SCardDate>
          </SCardFooter>
        </SCard>
        <NoteEditModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          note={note}
          onUpdateNote={onUpdate}
          onDeleteNote={onDelete}
        />
      </>
    );
  }
);

export default OptionListItem;
