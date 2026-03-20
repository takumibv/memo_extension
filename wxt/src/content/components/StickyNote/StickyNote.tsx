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

const ROOT_DOM_ID = 'react-container-for-note-extension';

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

    const noteBaseStyle = `pointer-events-auto rounded bg-white absolute left-0 top-0 transition-shadow duration-300`;
    const noteFixedStyle = is_fixed ? 'fixed shadow-lg' : 'shadow-md';
    const noteForwardStyle = isDragging || isEditing ? 'z-[1252]' : is_fixed ? 'z-[1251]' : 'z-[1250]';

    if (!is_open) {
      return (
        <div
          id={`${ROOT_DOM_ID}-sticky-note-${page_info_id}-${id}`}
          ref={noteRef}
          className={`${noteBaseStyle} ${noteFixedStyle} ${noteForwardStyle}`}
          style={{
            transform: `translate(${displayPositionX}px, ${displayPositionY}px)`,
            backgroundColor: color || defaultColor || '#fff',
          }}>
          <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
            <div className="flex cursor-default flex-col p-1">
              <button
                onClick={() => onClickOpenButton(true)}
                title={title}
                className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded hover:bg-black/10">
                <LogoIcon className="pointer-events-none h-6 w-6" />
              </button>
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
          backgroundColor: color || defaultColor || '#fff',
        }}>
        <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
          <div className="flex h-full cursor-default flex-col" onDoubleClick={() => setIsEditing(true)}>
            {/* Header with title input (editing) */}
            {isEditing && (
              <div className="flex justify-between overflow-y-auto border-b border-black/10 p-2">
                <input
                  ref={titleInputRef}
                  placeholder={t(I18N.TITLE_SORT_OPTION)}
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onFocus={() => setIsEnableDrag(false)}
                  onBlur={() => setIsEnableDrag(true)}
                  className="w-full break-all rounded border border-transparent bg-white text-base leading-tight text-gray-800 focus:border-black/10 focus:shadow-none focus:outline-none"
                />
              </div>
            )}
            {/* Header with title display (not editing) */}
            {!isEditing && title && (
              <div className="flex justify-between overflow-y-auto border-b border-black/10 p-2">
                <h2
                  className="flex-1 whitespace-pre-line break-all text-base leading-tight text-gray-800"
                  onDoubleClick={() => {
                    setTimeout(() => titleInputRef?.current?.focus(), 10);
                  }}>
                  {title || <span className="text-black/50">{t(I18N.TITLE_SORT_OPTION)}</span>}
                </h2>
                <div className="ml-1 h-5 w-5">
                  <button
                    onClick={() => onClickOpenButton(false)}
                    title={t(I18N.MINIMIZE)}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10">
                    <HiMinus className="h-4 w-4 text-black/40" />
                  </button>
                </div>
              </div>
            )}
            {/* Content */}
            <div className="relative min-h-[5em] flex-1 px-2 pb-10">
              {isEditing ? (
                <textarea
                  ref={descriptionTextareaRef}
                  placeholder={t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  onFocus={() => setIsEnableDrag(false)}
                  onBlur={() => setIsEnableDrag(true)}
                  className="mt-1 h-full w-full resize-none whitespace-pre-line break-all rounded border border-black/10 bg-white p-1 text-sm leading-tight text-gray-800 focus:shadow-none focus:outline-none"
                />
              ) : (
                <div
                  className="h-full overflow-y-auto"
                  onDoubleClick={() => {
                    setTimeout(() => descriptionTextareaRef?.current?.focus(), 10);
                  }}>
                  <p className="whitespace-pre-line break-all pt-2 text-sm leading-tight text-gray-800">
                    {description || <span className="text-black/50">{t(I18N.NEW_NOTE_DESCRIPTION)}</span>}
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
                className="pointer-events-auto mr-1 rounded bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600">
                {t(I18N.SAVE)}
              </button>
              <button
                onClick={onEditCancel}
                className="pointer-events-auto rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                {t(I18N.CANCEL)}
              </button>
            </>
          ) : (
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
            <HiArrowDownRight className="h-4 w-4 text-black/15" />
          </div>
        </DraggableCore>
      </div>
    );
  },
);

StickyNote.displayName = 'StickyNote';

export default StickyNote;
