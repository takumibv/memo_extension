import StickyNoteActions from './StickyNoteActions';
import { LogoIcon } from '@/shared/components/Icon';
import { initialPositionX, initialPositionY, useNoteEdit } from '@/shared/hooks/useNote';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { DraggableCore } from 'react-draggable';
import { HiArrowDownRight, HiMinus } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';
import type React from 'react';
import { cn } from '@/lib/utils';

const ROOT_DOM_ID = 'react-container-for-note-extension';

const isDarkColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
};

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
  portalContainer?: HTMLElement;
};

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
    portalContainer,
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

    const [isEditing, setIsEditing] = useState(false);
    const [isEnableDrag, setIsEnableDrag] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
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

    const [enableOpenButtonThreshold, setEnableOpenButtonThreshold] = useState(0);
    const onClickOpenButton = useCallback(
      (isOpen: boolean) => {
        if (enableOpenButtonThreshold < 10) {
          onUpdateNote({ ...defaultNote, is_open: isOpen });
        }
        setEnableOpenButtonThreshold(0);
      },
      [defaultNote, enableOpenButtonThreshold, onUpdateNote],
    );

    const onChangeColor = (newColor: string) => {
      onUpdateNote({ ...defaultNote, color: newColor });
    };

    const onKeyDownEditing = useCallback(
      (e: KeyboardEvent) => {
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
          onUpdateNote({ ...defaultNote, position_x: editPositionX, position_y: editPositionY });
        }
      },
    };

    const bgColor = color || defaultColor || '#fff';
    const dark = isDarkColor(bgColor);
    const textColor = dark ? '#f3f4f6' : '#1f2937';
    const placeholderColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)';
    const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const iconColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

    const noteBaseStyle = 'pointer-events-auto rounded left-0 top-0 transition-shadow duration-300';
    const noteFixedStyle = is_fixed ? 'fixed shadow-lg' : 'absolute shadow-md';
    const noteForwardStyle = isDragging || isEditing ? 'z-[1252]' : is_fixed ? 'z-[1251]' : 'z-[1250]';

    if (!is_open) {
      return (
        <div
          id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
          ref={noteRef}
          className={`${noteBaseStyle} ${noteFixedStyle} ${noteForwardStyle}`}
          style={{
            transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
            backgroundColor: bgColor,
            color: textColor,
          }}>
          <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
            <div className="flex cursor-default items-center gap-1 p-1">
              <button
                onClick={() => onClickOpenButton(true)}
                title={title}
                className="pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-black/10">
                <LogoIcon className="pointer-events-none h-6 w-6" />
              </button>
              {title && (
                <span className="max-w-32 truncate text-xs" style={{ color: textColor }}>
                  {title}
                </span>
              )}
            </div>
          </DraggableCore>
        </div>
      );
    }

    return (
      <div
        id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
        ref={noteRef}
        className={`${noteBaseStyle} ${noteFixedStyle} ${noteForwardStyle}`}
        style={{
          width: editWidth,
          height: editHeight,
          transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
          backgroundColor: bgColor,
          color: textColor,
        }}>
        <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
          <div className="flex h-full cursor-default flex-col" onDoubleClick={() => setIsEditing(true)}>
            {/* Header with title input (editing) */}
            {isEditing && (
              <div className="overflow-y-auto p-1" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <input
                  ref={titleInputRef}
                  placeholder={t(I18N.TITLE_SORT_OPTION)}
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onFocus={() => setIsEnableDrag(false)}
                  onBlur={() => setIsEnableDrag(true)}
                  className="w-full break-all rounded p-1 text-base leading-tight"
                  style={{ backgroundColor: 'transparent', color: textColor }}
                />
              </div>
            )}
            {/* Header with title display (not editing) */}
            {!isEditing && title && (
              <div
                className="flex justify-between overflow-y-auto p-2"
                style={{ borderBottom: `1px solid ${borderColor}` }}>
                <h2
                  className="flex-1 whitespace-pre-line break-all text-base leading-tight"
                  onDoubleClick={() => {
                    setTimeout(() => titleInputRef?.current?.focus(), 10);
                  }}>
                  {title || <span style={{ color: placeholderColor }}>{t(I18N.TITLE_SORT_OPTION)}</span>}
                </h2>
                <div className="ml-1 h-5 w-5">
                  <button
                    onClick={() => onClickOpenButton(false)}
                    title={t(I18N.MINIMIZE)}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10">
                    <HiMinus className="h-4 w-4" style={{ color: iconColor }} />
                  </button>
                </div>
              </div>
            )}
            {/* Content */}
            <div className={cn('relative min-h-[5em] flex-1 pb-10', isEditing ? 'px-1' : 'px-2')}>
              {isEditing ? (
                <textarea
                  ref={descriptionTextareaRef}
                  placeholder={t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  onFocus={() => setIsEnableDrag(false)}
                  onBlur={() => setIsEnableDrag(true)}
                  className="mt-1 h-full w-full resize-none whitespace-pre-line break-all rounded p-1 text-sm leading-tight"
                  style={{ backgroundColor: 'transparent', color: textColor }}
                />
              ) : (
                <div
                  className="h-full overflow-y-auto"
                  onDoubleClick={() => {
                    setTimeout(() => descriptionTextareaRef?.current?.focus(), 10);
                  }}>
                  <p className="whitespace-pre-line break-all pt-2 text-sm leading-tight">
                    {description || <span style={{ color: placeholderColor }}>{t(I18N.NEW_NOTE_DESCRIPTION)}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DraggableCore>

        {/* Footer */}
        <div className="pointer-events-none absolute bottom-0 left-0 flex h-10 items-center px-2">
          {isEditing ? (
            <>
              <button
                onClick={onEditDone}
                className="pointer-events-auto mr-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                {t(I18N.SAVE)}
              </button>
              <button
                onClick={onEditCancel}
                className="pointer-events-auto px-3 py-1 text-sm"
                style={{ color: textColor }}>
                {t(I18N.CANCEL)}
              </button>
            </>
          ) : (
            <StickyNoteActions
              title={title}
              description={description}
              is_fixed={is_fixed}
              color={color}
              iconColor={iconColor}
              activeIconColor={dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}
              setIsEditing={setIsEditing}
              onClickFixedButton={onClickFixedButton}
              onChangeColor={onChangeColor}
              onDeleteNote={() => onDeleteNote(defaultNote)}
              onCloseNote={() => onClickOpenButton(false)}
              portalContainer={portalContainer}
            />
          )}
        </div>

        {/* Resize handler */}
        <DraggableCore
          onStart={(_, data) => {
            setDragStartPositionX(editWidth - data.x);
            setDragStartPositionY(editHeight - data.y);
          }}
          onDrag={(_, data) => setEditSize(dragStartPositionX + data.x, dragStartPositionY + data.y)}
          onStop={() => {
            if (width !== editWidth || height !== editHeight) {
              onUpdateNote({ ...defaultNote, width: editWidth, height: editHeight });
            }
          }}
          nodeRef={noteRef}>
          <div ref={resizeHandlerRef} className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize">
            <HiArrowDownRight
              className="h-4 w-4"
              style={{ color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}
            />
          </div>
        </DraggableCore>
      </div>
    );
  },
);

StickyNote.displayName = 'StickyNote';

export default StickyNote;
