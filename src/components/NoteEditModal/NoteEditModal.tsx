import { Modal, Popover, styled } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FC } from "react";
import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH, useNoteEdit } from "../../hooks/useNote";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import { formatDate, isEqualsObject } from "../../utils";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  SModalWrapper,
  SModal,
  SModalHeader,
  SModalTitle,
  SModalContent,
  SModalSection,
  SModalDescription,
  SModalDescriptionText,
  SModalActions,
  SButton,
  SDivider,
  SAccordion,
  SAccordionSummary,
  SAccordionSummaryText,
  SNoteDetailArea,
  SNoteDetail,
  SNoteDetailTitle,
  SNoteDetailData,
  SNoteDetailDataInput,
  SModalScrollContent,
  SModalActionsLeft,
  SModalActionsRight,
  SIconButton,
  SMenuList,
  SMenuListItem,
  SNoteDetailDataSpan,
  SBackdrop,
} from "./NoteEditModal.style";
import { msg } from "../../utils";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  note: Note;
  onUpdateNote: (note: Note) => Promise<boolean>;
  onDeleteNote?: (note: Note) => Promise<boolean>;
};

export const NoteEditModal: FC<Props> = ({ isOpen, note, onClose, onUpdateNote, onDeleteNote }) => {
  const {
    title,
    description,
    is_fixed,
    is_open,
    position_x,
    position_y,
    width,
    height,
    created_at,
    updated_at,
  } = note;
  const [editIsFixed, setEditIsFixed] = useState(is_fixed);
  const [isApeal, setIsApeal] = useState(false);
  const [anchorActionsEl, setAnchorActionsEl] = useState<HTMLButtonElement | null>(null);

  const {
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editIsOpen,
    setEditIsOpen,
    editPositionX,
    editPositionY,
    setEditPosition,
    editWidth,
    editHeight,
    setEditSize,
  } = useNoteEdit(note);

  const editedNote: Note = {
    ...note,
    title: editTitle,
    description: editDescription,
    position_x: editPositionX,
    position_y: editPositionY,
    width: editWidth,
    height: editHeight,
    is_fixed: editIsFixed,
    is_open: editIsFixed,
  };

  const isEditing = useMemo(() => {
    const isEqualTitle = title === editTitle || (title === undefined && editTitle === "");
    const isEqualDescription =
      description === editDescription || (description === undefined && editDescription === "");
    const isEqualPositionX = position_x === editPositionX;
    const isEqualPositionY = position_y === editPositionY;
    const isEqualWidth = width === editWidth;
    const isEqualHeight = height === editHeight;
    const isEqualIsFixed = is_fixed === editIsFixed;
    const isEqualIsOpen = is_open === editIsOpen;

    return (
      !isEqualTitle ||
      !isEqualDescription ||
      !isEqualPositionX ||
      !isEqualPositionY ||
      !isEqualWidth ||
      !isEqualHeight ||
      !isEqualIsFixed ||
      !isEqualIsOpen
    );
  }, [note, editedNote]);

  const onChangeEditIsFixed = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "fixed") {
      setEditPosition(undefined, undefined);
      setEditIsFixed(true);
    } else {
      setEditPosition(position_x, position_y);
      setEditIsFixed(false);
    }
  }, []);

  const onChangeEditIsOpen = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "true") {
      setEditIsOpen(true);
    } else {
      setEditIsOpen(false);
    }
  }, []);

  const onSaveAndClose = useCallback(() => {
    onUpdateNote(editedNote);
    onClose && onClose();
  }, [editedNote]);

  const onCloseWithoutSave = useCallback(() => {
    setEditTitle(title);
    setEditDescription(description);
    setEditPosition(position_x, position_y);
    setEditSize(width ?? MIN_NOTE_WIDTH, height ?? MIN_NOTE_HEIGHT);
    onClose && onClose();
  }, [note, onClose]);

  const onDelete = useCallback(async () => {
    if (onDeleteNote && (await onDeleteNote(note))) {
      onClose && onClose();
      handleCloseActions();
    }
  }, []);

  const onClickMoreActions = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorActionsEl(e.currentTarget);
  };

  const handleCloseActions = () => {
    setAnchorActionsEl(null);
  };

  return (
    <Modal
      open={!!isOpen}
      onClose={() => {
        if (isEditing) {
          setIsApeal(true);
          setTimeout(() => {
            setIsApeal(false);
          }, 150);
        } else {
          onCloseWithoutSave();
        }
      }}
      BackdropComponent={SBackdrop}
    >
      <SModalWrapper $isApeal={isApeal}>
        <SModal>
          <SModalScrollContent>
            <SModalHeader>
              <SModalTitle
                placeholder={msg("title_sort_option")}
                defaultValue={title}
                onChange={(e) => setEditTitle(e.target.value)}
                minRows={1}
              />
            </SModalHeader>
            <SModalContent>
              <SModalSection>
                <SModalDescription>
                  <SModalDescriptionText
                    minRows={1}
                    placeholder={msg("input_description_placeholder")}
                    defaultValue={description}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </SModalDescription>
              </SModalSection>
              <SDivider />
              <SAccordion>
                <SAccordionSummary>
                  <SAccordionSummaryText>{msg("detail_msg")}</SAccordionSummaryText>
                </SAccordionSummary>
                <SModalSection>
                  <SNoteDetailArea>
                    <SNoteDetail>
                      <SNoteDetailTitle>{msg("pin_msg")}</SNoteDetailTitle>
                      <SNoteDetailData>
                        <select
                          value={editIsFixed ? "fixed" : "unfixed"}
                          onChange={onChangeEditIsFixed}
                        >
                          <option value="unfixed">{msg("pin_select_option_unfixed_msg")}</option>
                          <option value="fixed">{msg("pin_select_option_fixed_msg")}</option>
                        </select>
                      </SNoteDetailData>
                    </SNoteDetail>
                    <SNoteDetail>
                      <SNoteDetailTitle>{msg("open_msg")}</SNoteDetailTitle>
                      <SNoteDetailData>
                        <select value={editIsOpen ? "true" : "false"} onChange={onChangeEditIsOpen}>
                          <option value="false">{msg("open_select_option_yes_msg")}</option>
                          <option value="true">{msg("open_select_option_no_msg")}</option>
                        </select>
                      </SNoteDetailData>
                    </SNoteDetail>
                    <SNoteDetail>
                      <SNoteDetailTitle>{msg("position_msg")}</SNoteDetailTitle>
                      <SNoteDetailData>
                        <SNoteDetailDataSpan>x:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editPositionX ?? 0}
                          onChangeNumber={(val) => setEditPosition(val, editPositionY)}
                        />
                        <SNoteDetailDataSpan>y:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editPositionY ?? 0}
                          onChangeNumber={(val) => setEditPosition(editPositionX, val)}
                        />
                      </SNoteDetailData>
                    </SNoteDetail>
                    <SNoteDetail>
                      <SNoteDetailTitle>{msg("size_msg")}</SNoteDetailTitle>
                      <SNoteDetailData>
                        <SNoteDetailDataSpan>{msg("size_width_msg")}:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editWidth}
                          onChangeNumber={(val) => setEditSize(val, editHeight)}
                        />
                        <SNoteDetailDataSpan>{msg("size_height_msg")}:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editHeight}
                          onChangeNumber={(val) => setEditSize(editWidth, val)}
                        />
                      </SNoteDetailData>
                    </SNoteDetail>
                    {updated_at && (
                      <SNoteDetail>
                        <SNoteDetailTitle>{msg("updated_at_msg")}</SNoteDetailTitle>
                        <SNoteDetailData>{formatDate(new Date(updated_at))}</SNoteDetailData>
                      </SNoteDetail>
                    )}
                    {created_at && (
                      <SNoteDetail>
                        <SNoteDetailTitle>{msg("created_at_msg")}</SNoteDetailTitle>
                        <SNoteDetailData>{formatDate(new Date(created_at))}</SNoteDetailData>
                      </SNoteDetail>
                    )}
                  </SNoteDetailArea>
                </SModalSection>
              </SAccordion>
            </SModalContent>
          </SModalScrollContent>
          <SDivider />
          <SModalActions>
            <SModalActionsLeft>
              <SButton onClick={onSaveAndClose} disabled={!isEditing}>
                {msg("save_msg")}
              </SButton>
              <SButton secondary onClick={onCloseWithoutSave}>
                {isEditing ? msg("discard_close_msg") : msg("close_msg")}
              </SButton>
            </SModalActionsLeft>
            <SModalActionsRight>
              <SIconButton aria-labelledby="action-popover" onClick={onClickMoreActions}>
                <EllipsisVerticalIcon fill="rgba(0, 0, 0, 0.4)" />
              </SIconButton>
              <Popover
                id="action-popover"
                open={Boolean(anchorActionsEl)}
                anchorEl={anchorActionsEl}
                onClose={handleCloseActions}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <SMenuList>
                  <SMenuListItem onClick={onDelete}>{msg("delete_msg")}</SMenuListItem>
                </SMenuList>
              </Popover>
            </SModalActionsRight>
          </SModalActions>
        </SModal>
      </SModalWrapper>
    </Modal>
  );
};
