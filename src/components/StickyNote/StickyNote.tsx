import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { memo } from "react";
import { DraggableCore } from "react-draggable";
import Tooltip from "@mui/material/Tooltip";
import { initialPositionX, initialPositionY, useNoteEdit } from "../../hooks/useNote";
import { Note } from "../../types/Note";
import { CopyIcon, EditIcon, PinIcon, ResizeIcon, TrashIcon } from "../Icon";
import {
  SNote,
  SNoteInner,
  SResizeHandler,
  SNoteHeader,
  SNoteTitle,
  SNoteSpan,
  SNoteTitleInput,
  SNoteContent,
  SNoteContentScroll,
  SNoteDescription,
  SNoteDescriptionTextarea,
  SNoteFooter,
  SIconButtonWrap,
  SIconButton,
  SCopySuccessIcon,
  SButton,
  SHeaderFixedPinArea,
  SHeaderFixedButton,
} from "./StickyNote.style";
import { ROOT_DOM_ID } from "../../pages/contentScript";
import { msg } from "../../utils";
import { useClipboard } from "../../hooks/useClipboard";

type Props = {
  id?: number;
  page_info_id?: number;
  title?: string;
  description?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  is_open?: boolean;
  is_fixed?: boolean;
  created_at?: string;
  updated_at?: string;
  onUpdateNote: (note: Note) => Promise<boolean>;
  onDeleteNote: (note: Note) => Promise<boolean>;
};

/**
 * メモの付箋
 */
const StickyNote: React.VFC<Props> = memo(({ onUpdateNote, onDeleteNote, ...defaultNote }) => {
  const {
    id,
    page_info_id,
    title = "",
    description = "",
    position_x,
    position_y,
    width,
    height,
    is_open,
    is_fixed,
    created_at,
    updated_at,
  } = defaultNote;

  const noteRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

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
    getFixedPosition,
  } = useNoteEdit(defaultNote);

  /**
   * 編集モードかどうか
   * 編集モード: タイトルと説明を編集可能にする状態.
   * 発生条件
   * ・メモをダブルクリックした時
   * ・編集ボタンをクリックした時
   */
  const [isEditing, setIsEditing] = useState(false);

  // ドラッグ可能かどうか
  const [isEnableDrag, setIsEnableDrag] = useState(true);
  // ドラッグ中かどうか
  const [isDragging, setIsDragging] = useState(false);

  // ドラッグ開始位置
  const [dragStartPositionX, setDragStartPositionX] = useState(0);
  const [dragStartPositionY, setDragStartPositionY] = useState(0);

  const { isSuccessCopy, copyClipboard } = useClipboard();

  const displayPositionX = useMemo(() => editPositionX ?? initialPositionX(), [editPositionX]);
  const displayPositionY = useMemo(() => editPositionY ?? initialPositionY(), [editPositionY]);

  const onEditDone = useCallback(async () => {
    await onUpdateNote({
      ...defaultNote,
      title: editTitle,
      description: editDescription,
      position_x: editPositionX,
      position_y: editPositionY,
      width: editWidth,
      height: editHeight,
    });
    setIsEditing(false);
    setIsEnableDrag(true);
  }, [editTitle, editDescription, editPositionX, editPositionY, editWidth, editHeight]);

  const onEditCancel = useCallback(() => {
    setEditTitle(title);
    setEditDescription(description);
    setIsEditing(false);
    setIsEnableDrag(true);
  }, [title, description]);

  const onClickFixedButton = useCallback(() => {
    const { positionX, positionY } = getFixedPosition(!is_fixed);
    console.log("getFixedPosition::", positionX, positionY);
    setEditPosition(positionX, positionY);
    onUpdateNote({
      ...defaultNote,
      is_fixed: !is_fixed,
      position_x: positionX,
      position_y: positionY,
    });
  }, [getFixedPosition, onUpdateNote, defaultNote]);

  const onClickDeleteButton = () => {
    if (confirm(`「${title || "メモ"}」を削除してよろしいですか？`)) {
      onDeleteNote(defaultNote);
    }
  };

  // TODO Deleteで削除する
  const onKeyDownEditing = (e: KeyboardEvent) => {
    // isEnableDrag = focusしてない時 は無視する。
    if (isEnableDrag) return;

    if (e.key === "Escape" || e.key === "Esc") onEditDone();
    else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onEditDone();
  };

  const onBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      e.preventDefault();
      if (title !== editTitle || description !== editDescription) {
        e.returnValue = "";
      }
    },
    [editTitle, editDescription]
  );

  useEffect(() => {
    if (isEditing) {
      window.addEventListener("beforeunload", onBeforeUnload, false);
      window.addEventListener("keydown", onKeyDownEditing, false);
    } else {
      window.removeEventListener("beforeunload", onBeforeUnload, false);
      window.removeEventListener("keydown", onKeyDownEditing, false);
    }

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload, false);
      window.removeEventListener("keydown", onKeyDownEditing, false);
    };
  }, [
    isEditing,
    isEnableDrag,
    editTitle,
    editDescription,
    editPositionX,
    editPositionY,
    editWidth,
    editHeight,
  ]);

  return (
    <SNote
      id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
      ref={noteRef}
      style={{
        width: editWidth,
        height: editHeight,
        transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
      }}
      isFixed={is_fixed}
      isForward={isDragging || isEditing}
    >
      <DraggableCore
        scale={1}
        onStart={(_, data) => {
          setIsDragging(true);
          setDragStartPositionX(displayPositionX - data.x);
          setDragStartPositionY(displayPositionY - data.y);
        }}
        onDrag={(_, data) => {
          if (!isEnableDrag) return false;

          setEditPosition(dragStartPositionX + data.x, dragStartPositionY + data.y);
        }}
        onStop={() => {
          setIsDragging(false);

          if (position_x !== editPositionX || position_y !== editPositionY) {
            onUpdateNote({
              ...defaultNote,
              position_x: editPositionX,
              position_y: editPositionY,
            });
          }
        }}
        nodeRef={noteRef}
      >
        <SNoteInner
          onDoubleClick={() => {
            setIsEditing(true);
          }}
        >
          {isEditing && (
            <SNoteHeader>
              <SNoteTitleInput
                ref={titleInputRef}
                placeholder="タイトル"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              />
            </SNoteHeader>
          )}
          {!isEditing && title && (
            <SNoteHeader>
              <SNoteTitle
                onDoubleClick={() => {
                  setTimeout(() => {
                    titleInputRef?.current?.focus();
                    if (title === msg("new_note_title_msg")) {
                      titleInputRef?.current?.select();
                    }
                  }, 10);
                }}
              >
                {title || <SNoteSpan>タイトル</SNoteSpan>}
              </SNoteTitle>
              {!is_fixed && (
                <SHeaderFixedPinArea>
                  <Tooltip title="固定する" enterDelay={300} placement="top">
                    <div>
                      <SHeaderFixedButton onClick={onClickFixedButton}>
                        <PinIcon fill="rgba(0, 0, 0, 0.4)" />
                      </SHeaderFixedButton>
                    </div>
                  </Tooltip>
                </SHeaderFixedPinArea>
              )}
            </SNoteHeader>
          )}
          <SNoteContent>
            {isEditing ? (
              <SNoteDescriptionTextarea
                ref={descriptionTextareaRef}
                name=""
                id=""
                placeholder="メモを入力"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              >
                {editDescription}
              </SNoteDescriptionTextarea>
            ) : (
              <SNoteContentScroll
                onDoubleClick={() => {
                  setTimeout(() => {
                    descriptionTextareaRef?.current?.focus();
                  }, 10);
                }}
              >
                <SNoteDescription>
                  {description || <SNoteSpan>ダブルクリックで編集</SNoteSpan>}
                </SNoteDescription>
              </SNoteContentScroll>
            )}
          </SNoteContent>
        </SNoteInner>
      </DraggableCore>
      <SNoteFooter>
        {isEditing ? (
          <>
            <SButton onClick={onEditDone}>保存</SButton>
            <SButton secondary onClick={onEditCancel}>
              キャンセル
            </SButton>
          </>
        ) : (
          <>
            <Tooltip title="編集" enterDelay={300}>
              <SIconButtonWrap>
                <SIconButton onClick={() => setIsEditing(true)}>
                  <EditIcon fill="rgba(0, 0, 0, 0.4)" />
                </SIconButton>
              </SIconButtonWrap>
            </Tooltip>
            <Tooltip title={isSuccessCopy ? "コピーしました" : "コピー"} enterDelay={300}>
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
            <Tooltip title="固定を切り替える" enterDelay={300}>
              <SIconButtonWrap>
                <SIconButton onClick={onClickFixedButton} isFocus={!is_fixed}>
                  <PinIcon fill="rgba(0, 0, 0, 0.4)" />
                </SIconButton>
              </SIconButtonWrap>
            </Tooltip>
            <Tooltip title="削除" enterDelay={300}>
              <SIconButtonWrap>
                <SIconButton onClick={onClickDeleteButton}>
                  <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
                </SIconButton>
              </SIconButtonWrap>
            </Tooltip>
          </>
        )}
      </SNoteFooter>

      <DraggableCore
        onStart={(_, data) => {
          setDragStartPositionX(editWidth - data.x);
          setDragStartPositionY(editHeight - data.y);
        }}
        onDrag={(_, data) => setEditSize(dragStartPositionX + data.x, dragStartPositionY + data.y)}
        onStop={() => {
          if (width !== editWidth || height !== editHeight) {
            // 変化がなければ更新しない
            onUpdateNote({
              ...defaultNote,
              width: editWidth,
              height: editHeight,
            });
          }
        }}
        nodeRef={noteRef}
      >
        <SResizeHandler ref={resizeHandlerRef}>
          <ResizeIcon fill="rgba(0, 0, 0, 0.15)" />
        </SResizeHandler>
      </DraggableCore>
    </SNote>
  );
});

export default StickyNote;
