import { Backdrop, ModalUnstyled, Popover, styled } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VFC } from "react";
import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH, useNoteEdit } from "../../hooks/useNote";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import { formatDate, isEqualsObject } from "../../utils";
import { MoreIcon, TrashIcon } from "../Icon";
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
} from "./NoteEditModal.style";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  note: Note;
  onUpdateNote: (note: Note) => Promise<boolean>;
  onDeleteNote?: (note: Note) => Promise<boolean>;
};

export const NoteEditModal: VFC<Props> = ({
  isOpen,
  note,
  onClose,
  onUpdateNote,
  onDeleteNote,
}) => {
  const {
    title,
    description,
    is_fixed,
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

    return (
      !isEqualTitle ||
      !isEqualDescription ||
      !isEqualPositionX ||
      !isEqualPositionY ||
      !isEqualWidth ||
      !isEqualHeight ||
      !isEqualIsFixed
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

  useEffect(() => {
    console.log("editNote", note, editedNote, isEqualsObject(note, editedNote));
  }, [editedNote]);

  return (
    <ModalUnstyled
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
      BackdropComponent={Backdrop}
    >
      <SModalWrapper $isApeal={isApeal}>
        <SModal>
          <SModalScrollContent>
            <SModalHeader>
              <SModalTitle
                placeholder="タイトル"
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
                    placeholder="メモ"
                    defaultValue={description}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </SModalDescription>
              </SModalSection>
              <SDivider />
              <SAccordion>
                <SAccordionSummary>
                  <SAccordionSummaryText>詳細</SAccordionSummaryText>
                </SAccordionSummary>
                <SModalSection>
                  <SNoteDetailArea>
                    <SNoteDetail>
                      <SNoteDetailTitle>ピン</SNoteDetailTitle>
                      <SNoteDetailData>
                        <select
                          value={editIsFixed ? "fixed" : "unfixed"}
                          onChange={onChangeEditIsFixed}
                        >
                          <option value="unfixed">あり</option>
                          <option value="fixed">なし</option>
                        </select>
                      </SNoteDetailData>
                    </SNoteDetail>
                    <SNoteDetail>
                      <SNoteDetailTitle>位置</SNoteDetailTitle>
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
                      <SNoteDetailTitle>サイズ</SNoteDetailTitle>
                      <SNoteDetailData>
                        <SNoteDetailDataSpan>幅:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editWidth}
                          onChangeNumber={(val) => setEditSize(val, editHeight)}
                        />
                        <SNoteDetailDataSpan>高さ:</SNoteDetailDataSpan>
                        <SNoteDetailDataInput
                          valueNum={editHeight}
                          onChangeNumber={(val) => setEditSize(editWidth, val)}
                        />
                      </SNoteDetailData>
                    </SNoteDetail>
                    {updated_at && (
                      <SNoteDetail>
                        <SNoteDetailTitle>更新</SNoteDetailTitle>
                        <SNoteDetailData>{formatDate(new Date(updated_at))}</SNoteDetailData>
                      </SNoteDetail>
                    )}
                    {created_at && (
                      <SNoteDetail>
                        <SNoteDetailTitle>作成</SNoteDetailTitle>
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
                保存する
              </SButton>
              <SButton secondary onClick={onCloseWithoutSave}>
                {isEditing ? "変更を破棄して閉じる" : "閉じる"}
              </SButton>
            </SModalActionsLeft>
            <SModalActionsRight>
              <SIconButton aria-labelledby="action-popover" onClick={onClickMoreActions}>
                <MoreIcon fill="rgba(0, 0, 0, 0.4)" />
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
                  <SMenuListItem onClick={onDelete}>削除</SMenuListItem>
                </SMenuList>
              </Popover>
            </SModalActionsRight>
          </SModalActions>
        </SModal>
      </SModalWrapper>
    </ModalUnstyled>
  );
};
