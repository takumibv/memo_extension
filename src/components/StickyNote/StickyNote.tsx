import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { memo } from "react";
import { DraggableCore } from "react-draggable";
import Tooltip from "@mui/material/Tooltip";
import { initialPositionX, initialPositionY, useNoteEdit } from "../../hooks/useNote";
import { Note } from "../../types/Note";
import { ArrowDownRightIcon, MinusIcon } from "@heroicons/react/24/solid";
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
  SButton,
  SHeaderFixedPinArea,
  SOpenButton,
  SLogo,
  SIconButtonWrap,
} from "./StickyNote.style";
import { ROOT_DOM_ID } from "../../pages/contentScript";
import { msg } from "../../utils";
import IconButton from "../Button/IconButton";
import StickyNoteActions from "./StickyNoteActions";

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
  color?: string;
  onUpdateNote: (note: Note) => Promise<boolean>;
  onDeleteNote: (note: Note) => Promise<boolean>;
  defaultColor?: string;
};

/**
 * メモの付箋
 */
const StickyNote: React.FC<Props> = memo(
  ({
    onUpdateNote,
    onDeleteNote,
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
    color,
    defaultColor,
  }) => {
    const defaultNote: Note = useMemo(
      () => ({
        id,
        page_info_id,
        title,
        description,
        position_x,
        position_y,
        width,
        height,
        is_open,
        is_fixed,
        created_at,
        updated_at,
        color,
      }),
      [
        id,
        page_info_id,
        title,
        description,
        position_x,
        position_y,
        width,
        height,
        is_open,
        is_fixed,
        created_at,
        updated_at,
        color,
      ]
    );

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

    const displayPositionX = useMemo(() => editPositionX ?? initialPositionX(), [editPositionX]);
    const displayPositionY = useMemo(() => editPositionY ?? initialPositionY(), [editPositionY]);

    const onEditDone = useCallback(async () => {
      const isUpdated = await onUpdateNote({
        ...defaultNote,
        title: editTitle,
        description: editDescription,
        position_x: editPositionX,
        position_y: editPositionY,
        width: editWidth,
        height: editHeight,
      });
      if (isUpdated) {
        setIsEditing(false);
        setIsEnableDrag(true);
      } else {
        const message =
          (editDescription?.length ?? 0) > 2000
            ? msg("save_error_word_maximum_msg")
            : msg("save_error_msg_2");
        alert(`${msg("save_error_msg")}${message}`);
      }
    }, [
      defaultNote,
      editTitle,
      editDescription,
      editPositionX,
      editPositionY,
      editWidth,
      editHeight,
    ]);

    const onEditCancel = useCallback(() => {
      setEditTitle(title);
      setEditDescription(description);
      setIsEditing(false);
      setIsEnableDrag(true);
    }, [title, description]);

    const onClickFixedButton = useCallback(() => {
      const { positionX, positionY } = getFixedPosition(!is_fixed);
      setEditPosition(positionX, positionY);
      onUpdateNote({
        ...defaultNote,
        is_fixed: !is_fixed,
        position_x: positionX,
        position_y: positionY,
      });
    }, [getFixedPosition, onUpdateNote, defaultNote]);

    // 開閉ボタンが押せるかどうかの閾値 10を超えると押せない
    const [enableOpenButtonThreshold, setEnableOpenButtonThreshold] = useState(0);
    const onClickOpenButton = useCallback(
      (isOpen: boolean) => {
        if (enableOpenButtonThreshold < 10) {
          onUpdateNote({
            ...defaultNote,
            is_open: isOpen,
          });
        }
        setEnableOpenButtonThreshold(0);
      },
      [defaultNote, enableOpenButtonThreshold]
    );

    // カラーピッカー
    const onChangeColor = (color: string) => {
      onUpdateNote({
        ...defaultNote,
        color,
      });
    };

    // 「編集モード」時のキーイベント
    const onKeyDownEditing = (e: KeyboardEvent) => {
      // TODO Deleteで削除する

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

    // ドラッグ&ドロップのエリアのProps
    const draggableCoreProps = {
      scale: 1,
      onStart: (_: any, data: any) => {
        setEnableOpenButtonThreshold(0);
        setIsDragging(true);
        setDragStartPositionX(displayPositionX - data.x);
        setDragStartPositionY(displayPositionY - data.y);
      },
      onDrag: (_: any, data: any) => {
        if (!isEnableDrag) return false;

        setEnableOpenButtonThreshold((prev) => prev + 1);
        setEditPosition(dragStartPositionX + data.x, dragStartPositionY + data.y);
      },
      onStop: () => {
        setIsDragging(false);

        if (position_x !== editPositionX || position_y !== editPositionY) {
          onUpdateNote({
            ...defaultNote,
            position_x: editPositionX,
            position_y: editPositionY,
          });
        }
      },
    };

    if (!is_open) {
      // Close状態のスタイル
      return (
        <SNote
          id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
          ref={noteRef}
          style={{
            transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
            backgroundColor: color || defaultColor || "#fff",
          }}
          $isFixed={is_fixed}
        >
          <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
            <SNoteInner style={{ padding: "0.25rem" }}>
              <SOpenButton onClick={() => onClickOpenButton(true)}>
                <SLogo />
              </SOpenButton>
            </SNoteInner>
          </DraggableCore>
        </SNote>
      );
    }

    return (
      <SNote
        id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
        ref={noteRef}
        style={{
          width: editWidth,
          height: editHeight,
          transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
          backgroundColor: color || defaultColor || "#fff",
        }}
        $isFixed={is_fixed}
        $isForward={isDragging || isEditing}
      >
        <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
          <SNoteInner
            onDoubleClick={() => {
              setIsEditing(true);
            }}
          >
            {isEditing && (
              <SNoteHeader>
                <SNoteTitleInput
                  ref={titleInputRef}
                  placeholder={msg("title_sort_option")}
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
                    }, 10);
                  }}
                >
                  {title || <SNoteSpan>{msg("title_sort_option")}</SNoteSpan>}
                </SNoteTitle>
                <SHeaderFixedPinArea>
                  <Tooltip title={msg("minimize_msg")} enterDelay={300} placement="top">
                    <div>
                      <IconButton onClick={() => onClickOpenButton(false)}>
                        <MinusIcon fill="rgba(0, 0, 0, 0.4)" />
                      </IconButton>
                    </div>
                  </Tooltip>
                </SHeaderFixedPinArea>
              </SNoteHeader>
            )}
            <SNoteContent>
              {isEditing ? (
                <SNoteDescriptionTextarea
                  ref={descriptionTextareaRef}
                  name=""
                  id=""
                  placeholder={msg("input_description_placeholder")}
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
                    {description || <SNoteSpan>{msg("new_note_description_msg")}</SNoteSpan>}
                  </SNoteDescription>
                </SNoteContentScroll>
              )}
            </SNoteContent>
          </SNoteInner>
        </DraggableCore>
        <SNoteFooter>
          {isEditing ? (
            <>
              <SButton onClick={onEditDone}>{msg("save_msg")}</SButton>
              <SButton secondary onClick={onEditCancel}>
                {msg("cancel_msg")}
              </SButton>
            </>
          ) : (
            <>
              <StickyNoteActions
                title={title}
                description={description}
                is_fixed={is_fixed}
                color={color}
                setIsEditing={setIsEditing}
                onClickFixedButton={onClickFixedButton}
                onChangeColor={onChangeColor}
                onDeleteNote={() => onDeleteNote(defaultNote)}
                onCloseNote={() => onClickOpenButton(false)}
              />
            </>
          )}
        </SNoteFooter>

        <DraggableCore
          onStart={(_, data) => {
            setDragStartPositionX(editWidth - data.x);
            setDragStartPositionY(editHeight - data.y);
          }}
          onDrag={(_, data) =>
            setEditSize(dragStartPositionX + data.x, dragStartPositionY + data.y)
          }
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
            <ArrowDownRightIcon fill="rgba(0, 0, 0, 0.15)" />
          </SResizeHandler>
        </DraggableCore>
      </SNote>
    );
  }
);

export default StickyNote;
