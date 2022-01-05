import React, { useCallback, useEffect, useRef, useState } from "react";
import { memo } from "react";
import { DraggableCore } from "react-draggable";
import styled, { css } from "styled-components";
import Tooltip from "@mui/material/Tooltip";
import { useNoteEdit } from "../hooks/useNote";
import { baseCSS } from "../resetCSS";
import { Note } from "../types/Note";
import Button from "./Button";
import { CopyIcon, CopySuccessIcon, EditIcon, PinIcon, ResizeIcon, TrashIcon } from "./Icon";
import IconButton from "./IconButton";

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

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPositionX, setDragStartPositionX] = useState(0);
  const [dragStartPositionY, setDragStartPositionY] = useState(0);

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

  return (
    <SNote
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

interface SNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  isFixed?: boolean;
  isForward?: boolean;
}

const SNote = styled.div<SNoteProps>`
  ${baseCSS("div")}

  pointer-events: initial;
  background-color: #fff;
  border-radius: 0.25em;
  z-index: 1250;
  position: absolute;
  left: 0;
  top: 0;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  ${({ isFixed }) =>
    isFixed &&
    css`
      position: fixed;
      z-index: 1251;
    `}

  ${({ isForward }) =>
    isForward &&
    css`
      z-index: 1252;
    `}
`;

const SNoteInner = styled.div`
  ${baseCSS("div")}

  display: flex;
  height: 100%;
  flex-direction: column;
  cursor: default;
`;

const SResizeHandler = styled.div`
  ${baseCSS("div")}

  position: absolute;
  cursor: nwse-resize;
  width: 1em;
  height: 1em;
  right: 0;
  bottom: 0;
  z-index: 1;

  svg {
    transform: rotate(45deg);
  }
`;

const SNoteHeader = styled.div`
  ${baseCSS("div")}

  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  border-bottom: 0.0625em solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const noteTitleCSS = css`
  font-size: 1em;
  line-height: 1.25;
  color: #333;
  border-width: 0.0625em;
  border-color: transparent;
  border-radius: 0.25em;
`;

const SNoteTitle = styled.h2`
  ${baseCSS("h2")}

  ${noteTitleCSS}
  flex: 1;
`;

const SNoteSpan = styled.span`
  ${baseCSS("span")}

  color: #999;
  flex: 1;
`;

const SNoteTitleInput = styled.input`
  ${baseCSS("input")}

  ${noteTitleCSS}
  margin: -0.25em;
  padding: 0.25em;
  width: calc(100% + 0.5em);

  &[type="text"],
  &[type="text"]:focus,
  &[type="text"]:focus-visible {
    background-color: #fff;
    border: 0.0625em solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
  }
`;

const SNoteContent = styled.div`
  ${baseCSS("div")}

  flex: 1;
  min-height: 5em;
  padding: 0 0.5em 2.5em;
  position: relative;
`;

const SNoteContentScroll = styled.div`
  ${baseCSS("div")}

  height: 100%;
  overflow-y: auto;
`;

const noteDescriptionCSS = css`
  padding-top: 0.5em;
  font-size: 0.875em;
  line-height: 1.25;
  color: #333;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.25em;
`;

const SNoteDescription = styled.p`
  ${baseCSS("p")}

  ${noteDescriptionCSS}
  white-space: pre-line;
`;

const SNoteDescriptionTextarea = styled.textarea`
  ${baseCSS("textarea")}

  ${noteDescriptionCSS}
  width: calc(100% + 0.5em);
  height: calc(100% - 0.25em);
  margin: 0.25em -0.25em 0;
  padding: 0.25em;
  resize: none;

  &,
  &:focus,
  &:focus-visible {
    background-color: #fff;
    border: 0.0625em solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
  }
`;

const SNoteFooter = styled.div`
  ${baseCSS("div")}

  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  padding: 0.5em;
  height: 2.5em;
`;

const SIconButtonWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5em;

  &:first-child {
    margin-left: 0;
  }
`;

const SIconButton = styled(IconButton)`
  pointer-events: initial;
`;

const SCopySuccessIcon = styled(CopySuccessIcon)`
  width: 1.25em;
  height: 1.25em;
`;

const SButton = styled(Button)`
  pointer-events: initial;
  margin-left: 0.25em;

  &:first-child {
    margin-left: 0;
  }
`;

const SHeaderFixedPinArea = styled.div`
  ${baseCSS("div")}

  margin-left: 0.25rem;
  width: 1.25em;
  height: 1.25em;
`;

const SHeaderFixedButton = styled(IconButton)`
  transform: rotate(45deg);
`;

export default StickyNote;
