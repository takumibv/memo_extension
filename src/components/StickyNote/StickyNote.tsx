import React, { useCallback, useEffect, useRef, useState } from "react";
import { memo } from "react";
import { DraggableCore } from "react-draggable";
import Tooltip from "@mui/material/Tooltip";
import { useNoteEdit } from "../../hooks/useNote";
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
import { ROOT_DOM_ID } from "../../contentScript";

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
    title: defaultTitle = "",
    description: defaultDescription = "",
    position_x: defaultPositionX,
    position_y: defaultPositionY,
    width: defaultWidth,
    height: defaultHeight,
    is_open: defaultIsOpen,
    is_fixed: defaultIsFixed,
    created_at: defaultCreatedAt,
    updated_at: defaultUpdatedAt,
  } = defaultNote;

  const noteRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    title,
    setTitle,
    description,
    setDescription,
    positionX,
    positionY,
    setPosition,
    width,
    height,
    setSize,
    isOpen,
    setIsOpen,
    isFixed,
    setIsFixed,
  } = useNoteEdit(defaultNote);

  // 編集モードかどうか
  const [isEditing, setIsEditing] = useState(false);

  // ドラッグ可能かどうか
  const [isEnableDrag, setIsEnableDrag] = useState(true);

  // ドラッグ開始位置
  const [dragStartPositionX, setDragStartPositionX] = useState(0);
  const [dragStartPositionY, setDragStartPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccessCopy, setIsSuccessCopy] = useState(false);

  const onEditDone = useCallback(async () => {
    await onUpdateNote({
      ...defaultNote,
      title,
      description,
      position_x: positionX,
      position_y: positionY,
      width,
      height,
      is_fixed: isFixed,
    });
    setIsEditing(false);
    setIsEnableDrag(true);
  }, [title, description, positionX, positionY, width, height, isFixed]);

  const onEditCancel = useCallback(() => {
    setTitle(defaultTitle);
    setDescription(defaultDescription);
    setIsEditing(false);
    setIsEnableDrag(true);
  }, [defaultTitle, defaultDescription]);

  const onClickCopyButton = useCallback(() => {
    navigator.clipboard.writeText(`${defaultTitle}\n${defaultDescription}`).then(() => {
      setIsSuccessCopy(true);

      setTimeout(() => {
        setIsSuccessCopy(false);
      }, 1000);
    });
  }, [defaultTitle, defaultDescription]);

  const onClickFixedButton = () => {
    const { isFixed: newIsFixed, positionX, positionY } = setIsFixed(!isFixed);

    onUpdateNote({
      ...defaultNote,
      position_x: positionX,
      position_y: positionY,
      is_fixed: newIsFixed,
    });
  };

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

  const onBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  }, []);

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
  }, [isEditing, isEnableDrag, title, description, positionX, positionY, width, height, isFixed]);

  useEffect(() => {
    console.log(defaultPositionX, defaultPositionY);
  }, []);

  return (
    <SNote
      id={`${ROOT_DOM_ID}-sticky-note-${id}`}
      ref={noteRef}
      style={{
        width: width,
        height: height,
        transform: `translate(${positionX}px, ${positionY}px)`,
      }}
      isFixed={isFixed}
      isForward={isDragging || isEditing}
    >
      <DraggableCore
        scale={1}
        onStart={(_, data) => {
          setIsDragging(true);
          setDragStartPositionX(positionX - data.x);
          setDragStartPositionY(positionY - data.y);
        }}
        onDrag={(_, data) => {
          if (!isEnableDrag) return false;

          setPosition(dragStartPositionX + data.x, dragStartPositionY + data.y);
        }}
        onStop={() => {
          setIsDragging(false);

          if (defaultPositionX !== positionX || defaultPositionY !== positionY) {
            onUpdateNote({
              ...defaultNote,
              position_x: positionX,
              position_y: positionY,
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
          <SNoteHeader>
            {isEditing ? (
              <SNoteTitleInput
                ref={titleInputRef}
                placeholder="タイトル"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              />
            ) : (
              <>
                <SNoteTitle
                  onDoubleClick={() => {
                    setTimeout(() => {
                      titleInputRef?.current?.focus();
                    }, 10);
                  }}
                >
                  {title || <SNoteSpan>タイトル</SNoteSpan>}
                </SNoteTitle>
                {isFixed && (
                  <SHeaderFixedPinArea>
                    <Tooltip title="固定を解除する" enterDelay={300} placement="top">
                      <div>
                        <SHeaderFixedButton onClick={onClickFixedButton}>
                          <PinIcon fill="rgba(0, 0, 0, 0.4)" />
                        </SHeaderFixedButton>
                      </div>
                    </Tooltip>
                  </SHeaderFixedPinArea>
                )}
              </>
            )}
          </SNoteHeader>
          <SNoteContent>
            {isEditing ? (
              <SNoteDescriptionTextarea
                ref={descriptionTextareaRef}
                name=""
                id=""
                placeholder="メモを入力"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              >
                {description}
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
                  <SIconButton onClick={onClickCopyButton}>
                    <CopyIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                )}
              </SIconButtonWrap>
            </Tooltip>
            <Tooltip title="固定を切り替える" enterDelay={300}>
              <SIconButtonWrap>
                <SIconButton onClick={onClickFixedButton}>
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
          setDragStartPositionX(width - data.x);
          setDragStartPositionY(height - data.y);
        }}
        onDrag={(_, data) => {
          setSize(dragStartPositionX + data.x, dragStartPositionY + data.y);
        }}
        onStop={() => {
          if (defaultWidth !== width || defaultHeight !== height) {
            onUpdateNote({
              ...defaultNote,
              width,
              height,
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
