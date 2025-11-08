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
} from './StickyNote.style.js';
import StickyNoteActions from './StickyNoteActions.js';
import { t } from '@extension/i18n';
import { IconButton } from '@extension/shared/lib/components/Button/index.js';
import { initialPositionX, initialPositionY, useNoteEdit } from '@extension/shared/lib/hooks/useNote.js';
import { I18N } from '@extension/shared/lib/i18n/keys.js';
import { ArrowDownRightIcon, MinusIcon } from '@heroicons/react/24/solid';
import Tooltip from '@mui/material/Tooltip';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { DraggableCore } from 'react-draggable';
import type { Note } from '@extension/shared/lib/types/Note.js';
import type React from 'react';

// eslint-disable-next-line import-x/exports-last
export const ROOT_DOM_ID = 'react-container-for-note-extension';

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
    title = '',
    description = '',
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
      ],
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
          (editDescription?.length ?? 0) > 2000 ? t(I18N.SAVE_ERROR_WORD_MAXIMUM) : t(I18N.SAVE_ERROR_MSG_2);
        alert(`${t(I18N.SAVE_ERROR)}${message}`);
      }
    }, [defaultNote, editTitle, editDescription, editPositionX, editPositionY, editWidth, editHeight, onUpdateNote]);

    const onEditCancel = useCallback(() => {
      setEditTitle(title);
      setEditDescription(description);
      setIsEditing(false);
      setIsEnableDrag(true);
    }, [title, description, setEditTitle, setEditDescription]);

    const onClickFixedButton = useCallback(() => {
      const { positionX, positionY } = getFixedPosition(!is_fixed);
      setEditPosition(positionX, positionY);
      onUpdateNote({
        ...defaultNote,
        is_fixed: !is_fixed,
        position_x: positionX,
        position_y: positionY,
      });
    }, [getFixedPosition, is_fixed, setEditPosition, onUpdateNote, defaultNote]);

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
      [defaultNote, enableOpenButtonThreshold, onUpdateNote],
    );

    // カラーピッカー
    const onChangeColor = (color: string) => {
      onUpdateNote({
        ...defaultNote,
        color,
      });
    };

    // 「編集モード」時のキーイベント
    const onKeyDownEditing = useCallback(
      (e: KeyboardEvent) => {
        // TODO Deleteで削除する

        // isEnableDrag = focusしてない時 は無視する。
        if (isEnableDrag) return;

        if (e.key === 'Escape' || e.key === 'Esc') onEditDone();
        else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onEditDone();
      },
      [isEnableDrag, onEditDone],
    );

    const onBeforeUnload = useCallback(
      (e: BeforeUnloadEvent) => {
        e.preventDefault();
        if (title !== editTitle || description !== editDescription) {
          e.returnValue = '';
        }
      },
      [title, description, editTitle, editDescription],
    );

    useEffect(() => {
      if (isEditing) {
        window.addEventListener('beforeunload', onBeforeUnload, false);
        window.addEventListener('keydown', onKeyDownEditing, false);
      } else {
        window.removeEventListener('beforeunload', onBeforeUnload, false);
        window.removeEventListener('keydown', onKeyDownEditing, false);
      }

      return () => {
        window.removeEventListener('beforeunload', onBeforeUnload, false);
        window.removeEventListener('keydown', onKeyDownEditing, false);
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
      onBeforeUnload,
      onKeyDownEditing,
    ]);

    // ドラッグ&ドロップのエリアのProps
    const draggableCoreProps = {
      scale: 1,
      onStart: (_: unknown, data: { x: number; y: number }) => {
        setEnableOpenButtonThreshold(0);
        setIsDragging(true);
        setDragStartPositionX(displayPositionX - data.x);
        setDragStartPositionY(displayPositionY - data.y);
      },
      onDrag: (_: unknown, data: { x: number; y: number }) => {
        if (!isEnableDrag) return;

        setEnableOpenButtonThreshold(prev => prev + 1);
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
            backgroundColor: color || defaultColor || '#fff',
          }}
          $isFixed={is_fixed}>
          <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
            <SNoteInner style={{ padding: '0.25rem' }}>
              <SOpenButton onClick={() => onClickOpenButton(true)} title={title}>
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
          backgroundColor: color || defaultColor || '#fff',
        }}
        $isFixed={is_fixed}
        $isForward={isDragging || isEditing}>
        <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
          <SNoteInner
            onDoubleClick={() => {
              setIsEditing(true);
            }}>
            {isEditing && (
              <SNoteHeader>
                <SNoteTitleInput
                  ref={titleInputRef}
                  placeholder={t(I18N.TITLE_SORT_OPTION)}
                  type="text"
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
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
                  }}>
                  {title || <SNoteSpan>{t(I18N.TITLE_SORT_OPTION)}</SNoteSpan>}
                </SNoteTitle>
                <SHeaderFixedPinArea>
                  <Tooltip title={t(I18N.MINIMIZE)} enterDelay={300} placement="top">
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
                  placeholder={t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}
                  value={editDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                  onFocus={() => setIsEnableDrag(false)}
                  onBlur={() => setIsEnableDrag(true)}>
                  {editDescription}
                </SNoteDescriptionTextarea>
              ) : (
                <SNoteContentScroll
                  onDoubleClick={() => {
                    setTimeout(() => {
                      descriptionTextareaRef?.current?.focus();
                    }, 10);
                  }}>
                  <SNoteDescription>
                    {description || <SNoteSpan>{t(I18N.NEW_NOTE_DESCRIPTION)}</SNoteSpan>}
                  </SNoteDescription>
                </SNoteContentScroll>
              )}
            </SNoteContent>
          </SNoteInner>
        </DraggableCore>
        <SNoteFooter>
          {isEditing ? (
            <>
              <SButton onClick={onEditDone}>{t(I18N.SAVE)}</SButton>
              <SButton secondary onClick={onEditCancel}>
                {t(I18N.CANCEL)}
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
          nodeRef={noteRef}>
          <SResizeHandler ref={resizeHandlerRef}>
            <ArrowDownRightIcon fill="rgba(0, 0, 0, 0.15)" />
          </SResizeHandler>
        </DraggableCore>
      </SNote>
    );
  },
);

StickyNote.displayName = 'StickyNote';

export default StickyNote;
