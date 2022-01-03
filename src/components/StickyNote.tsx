import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { memo } from "react";
import Draggable, { DraggableCore } from "react-draggable";
import styled, { css } from "styled-components";
import { useNoteEdit, useNotePosition, useNoteSize } from "../hooks/useNote";
import { baseCSS } from "../resetCSS";
import { Note } from "../types/Note";
import Button from "./Button";
import IconButton from "./IconButton";

type Props = {
  note: Note;
  onUpdateNote: (note: Note) => void;
};

/**
 * メモの付箋
 */
const StickyNote: React.VFC<Props> = memo(({ note, onUpdateNote }) => {
  const { title: defaultTitle = "", description: defaultDescription = "" } = note;
  const noteRef = useRef(null);
  const resizeHandlerRef = useRef(null);

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
  } = useNoteEdit(note);

  // 編集モードかどうか
  const [isEditing, setIsEditing] = useState(false);

  // ドラッグ可能かどうか
  const [IsEnableDrag, setIsEnableDrag] = useState(true);

  const onEditDone = useCallback(() => {
    onUpdateNote({
      ...note,
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
  }, []);

  const onBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  }, []);

  const onKeyDownEditing = (e: KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Esc") {
      onEditCancel();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onEditDone();
    }
  };

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
  }, [isEditing, title, description, positionX, positionY, width, height, isFixed]);

  return (
    <SNote
      ref={noteRef}
      style={{
        width: width,
        height: height,
        transform: `translate(${positionX}px, ${positionY}px)`,
      }}
      isFixed={isFixed}
      onDoubleClick={() => {
        // TODO: ダブルクリックしたInputにフォーカスを当てる
        setIsEditing(true);
      }}
    >
      <DraggableCore
        scale={1}
        onStart={(e, data) => {
          console.log("this.handleStart", IsEnableDrag, e, data);
        }}
        onDrag={(_, data) => {
          if (!IsEnableDrag) return false;

          setPosition(positionX + data.deltaX, positionY + data.deltaY);
        }}
        onStop={(e, data) => {
          console.log("this.handleStop)", e, data);
          // TODO: ドラッグ終了時に移動していた場合、onUpdateNoteを呼ぶ
        }}
        nodeRef={noteRef}
      >
        <SNoteInner>
          <SNoteHeader>
            {isEditing ? (
              <SNoteTitleInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              />
            ) : (
              <SNoteTitle>{title}</SNoteTitle>
            )}
          </SNoteHeader>
          <SNoteContent>
            {isEditing ? (
              <SNoteDescriptionTextarea
                name=""
                id=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setIsEnableDrag(false)}
                onBlur={() => setIsEnableDrag(true)}
              >
                {description}
              </SNoteDescriptionTextarea>
            ) : (
              <SNoteContentScroll>
                <SNoteDescription>{description}</SNoteDescription>
              </SNoteContentScroll>
            )}
          </SNoteContent>
        </SNoteInner>
      </DraggableCore>
      <SNoteFooter>
        {isEditing ? (
          <>
            <SButton onClick={() => onEditDone()}>保存</SButton>
            <SButton secondary onClick={() => onEditCancel()}>
              キャンセル
            </SButton>
          </>
        ) : (
          <>
            {/* TODO ツールチップボタン */}
            <SIconButton onClick={() => setIsEditing(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="rgba(0, 0, 0, 0.4)">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </SIconButton>
            <SIconButton
              onClick={() => {
                /** TODO コピーボタン */
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="rgba(0, 0, 0, 0.4)">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </SIconButton>
            <SIconButton
              onClick={() => {
                /** TODO ピンボタン */
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(0, 0, 0, 0.4)">
                <g>
                  <rect fill="none" height="24" width="24" />
                </g>
                <g>
                  <path
                    d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z"
                    fillRule="evenodd"
                  />
                </g>
              </svg>
            </SIconButton>
            <SIconButton
              onClick={() => {
                /** TODO ゴミ箱ボタン */
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="rgba(0, 0, 0, 0.4)">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </SIconButton>
          </>
        )}
      </SNoteFooter>

      <DraggableCore
        onStart={(e, data) => {
          console.log("this.handleStart", e, data);
        }}
        onDrag={(_, data) => {
          setSize(width + data.deltaX, height + data.deltaY);
        }}
        onStop={(e, data) => {
          console.log("this.handleStop", e, data);
          // TODO: ドラッグ終了時にサイズ変更していた場合、onUpdateNoteを呼ぶ
        }}
        nodeRef={noteRef}
      >
        <SResizeHandler ref={resizeHandlerRef}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="rgba(0, 0, 0, 0.15)"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </SResizeHandler>
      </DraggableCore>
    </SNote>
  );
});

interface SNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  isFixed?: boolean;
}

const SNote = styled.div<SNoteProps>`
  ${baseCSS("div")}

  pointer-events: initial;
  background-color: #fff;
  border-radius: 0.25em;
  z-index: 10000;
  position: absolute;
  left: 0;
  top: 0;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  ${({ isFixed }) =>
    isFixed &&
    css`
      position: fixed;
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

  padding: 0.5em;
  border-bottom: 0.0625em solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const noteTitleCSS = css`
  font-size: 1em;
  line-height: 1.25;
  color: #333;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.25em;
`;

const SNoteTitle = styled.h2`
  ${baseCSS("h2")}

  ${noteTitleCSS}
`;

const SNoteTitleInput = styled.input`
  ${baseCSS("input")}

  ${noteTitleCSS}
  margin: -0.25em;
  padding: 0.25em;
  width: calc(100% + 0.5em);
  border-color: rgba(0, 0, 0, 0.1);
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

const SIconButton = styled(IconButton)`
  pointer-events: initial;
  margin-left: 0.5em;

  &:first-child {
    margin-left: 0;
  }
`;

const SButton = styled(Button)`
  pointer-events: initial;
  margin-left: 0.25em;

  &:first-child {
    margin-left: 0;
  }
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
  border-color: rgba(0, 0, 0, 0.1);
`;

export default StickyNote;
