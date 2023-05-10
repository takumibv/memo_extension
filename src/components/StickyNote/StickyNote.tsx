import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { memo } from "react";
import { DraggableCore } from "react-draggable";
import Tooltip from "@mui/material/Tooltip";
import { initialPositionX, initialPositionY, useNoteEdit } from "../../hooks/useNote";
import { Note } from "../../types/Note";
import { CopyIcon, PinIcon } from "../Icon";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowDownRightIcon,
  MinusIcon,
} from "@heroicons/react/24/solid";
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
  SOpenButton,
  SLogo,
} from "./StickyNote.style";
import { ROOT_DOM_ID } from "../../pages/contentScript";
import { msg } from "../../utils";
import { useClipboard } from "../../hooks/useClipboard";
import IconButton from "../Button/IconButton";

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
const StickyNote: React.VFC<Props> = memo(
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

    // 開閉ボタンが押せるかどうか
    const [isEnableOpenButton, setIsEnableOpenButton] = useState(true);
    const onClickOpenButton = useCallback(() => {
      if (isEnableOpenButton) {
        onUpdateNote({
          ...defaultNote,
          is_open: !is_open,
        });
      }
      setIsEnableOpenButton(true);
    }, [defaultNote, isEnableOpenButton]);

    const onClickDeleteButton = () => {
      if (confirm(`「${title || "メモ"}」を削除してよろしいですか？`)) {
        onDeleteNote(defaultNote);
      }
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

    if (!is_open) {
      // Close状態のスタイル
      return (
        <SNote
          id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
          ref={noteRef}
          style={{
            transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
          }}
          $isFixed={is_fixed}
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

              setIsEnableOpenButton(false);
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
            <SNoteInner style={{ padding: "0.25rem" }}>
              <SOpenButton onClick={onClickOpenButton}>
                <SLogo
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAnCAYAAABjYToLAAAACXBIWXMAAAsSAAALEgHS3X78AAAEwUlEQVRYw+2YbUhbVxjH/zc3jXnVkuZqnHUtBtfplrjCykA73Ae1bOsHsRsIESdhurHtwyaFDsbKCmO0DNQPwyl0YlooQ0hWGPh2wU5h/eDqqO0W5oYvsWxibt40ydXca7z7EL1GjTFt7kRYz5dw7rn3nB////M855wQgiDgMDa51BNWV1efNJvNjevr62cDgcBzBEHI5HK5miAIcmFhQRuNRvdbcxJAk1wimKPFxcWfeTye99VqtVqn08lMJhMsFguCwWAIgA4ADAYDKIra9i3LsrDb7dz4+LjA8/ynNE13ZKzYBlCHUqm0UhQlt1qtqKioAAAIggCfz+fPz8/X7/X94OAg+vr6eJIkR3meb6Fpei5jK2022/ns7OxbKpVK19HRAZPJJI5tQsVisaRQbrcbnZ2dHMMwAY7j6mma/kmSGGttbb3s9XovNzU1kXV1ddvG1tbW4Pf7VwVB2AXFsiwcDgdGRkaiPM9fpWn6C8mC32azdfl8vpb29nYiUaUEqBVBEFQ7vxsbG4Pdbl+TyWR3dtqWMVhzc/NFn8/X0tbWljaU2+1Gb2/v6vz8fCgajbbQNH07nbWIdOuYzWY77/V6b7e3t5PpQG3aNjQ0BLVafY1l2as0TQfTFYGoqqpKi0yn06GhoQE7YyoYDCIUCkGhUIjPJiYm0NPTA5ZlwfN80vlomib2tZL+/n5KqBuOU5icsuyCYiMBRKOcCMUwDLq7O8F4ZmGtncLpF5ILdPHLFzOv/OEICWd/Dq5cadz2PBIJIBzmRNsGBwfhdDrxyukA3nxrFsqsGOYebb2v1RAw5spgzJVhaTkrc7C794wwmZ5HWVlZUqiJiQncsF+HThPEu/V/II9ityYnAWNeHEarIaTdKx0Dx3Hh7XNif3npH6yskmAYBjdv9sLleojqs9OwlHjFdwx6GQzH4gr9J5t4OEJiZi6K8vLyeKAH3IhySjidTgz0/whLiQcfNsZtU2YROP5MHEiZRSDTlhJs2q1CUVEhtFotggE37k/OoqvrGyjkS7DW/o4CIwvDMRmMuXIczckcJn2wORWMxkL89eevuP7dLbhcD/HqmTnUVHpgzJXBoD8CueQHpxRgw6N6dNoLEGFJFBY+wseffA59DouvLv2G4iIByqzkNMOjenz97bNiX6OO4YN3/kZNpV8asJpKP2oq/ai1mcEwDDiOQyhCwFwCAHtbNjS6tW8XnVhB97WpJ1YsZdoUFkSRo12OlwiWxPDonkcrLDIKPHBpoVHHNupWLCMrU4Ipjqyj5jW/uNhQCjBHPyWqLUVLq9DUvcEAAB64tFhkFHvGV02lP2OlHgvsXIIKm8rshIqwpGRqpQ2WR3Eof3lJhEgW9EUnVlBWGj5YsEQ7dybBZtBf2Bg/cLCy0jDyDNyuJHD0U9CoY6KiBw62Mwmm51QIR0jJg/6JwBKD2zlA4e69HERYUnIbHxtMq4mJcD//kgNHPwVLaRh5FHewYIseBSZd2u12vr6VBDNuldhPPCol/koKNjyqR63NjEVvPOMaPioVM9F0cgVFJ1biZcTAoeLMkngSee/SKfwwEK9zM24Vam3mlNvYvrek/S4jkv8jVP/SvrckGQ5pewr2FOx/CybfTN/D1v4FPIYdz2gNefIAAAAASUVORK5CYII="
                  alt=""
                />
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
        }}
        $isFixed={is_fixed}
        $isForward={isDragging || isEditing}
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

            setIsEnableOpenButton(false);
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
                <SHeaderFixedPinArea>
                  <Tooltip title="最小化する" enterDelay={300} placement="top">
                    <div>
                      <IconButton onClick={onClickOpenButton}>
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
                    <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
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
              <Tooltip title="ピンを切り替える" enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton onClick={onClickFixedButton} isFocus={!is_fixed}>
                    <PinIcon fill={is_fixed ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 1)"} />
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
