import StickyNoteActions from './StickyNoteActions';
import { useElementTracker } from '@/content/hooks/useElementTracker';
import { useSelectionHighlight } from '@/content/hooks/useSelectionMarker';
import { computePinnedPlacement } from '@/content/utils/pinnedPlacement';
import type { Placement } from '@/content/utils/pinnedPlacement';
import { LogoIcon } from '@/shared/components/Icon';
import { initialPositionX, initialPositionY, useNoteEdit } from '@/shared/hooks/useNote';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { DraggableCore } from 'react-draggable';
import { HiArrowDownRight, HiExclamationTriangle, HiMinus } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';
import type { Selection } from '@/shared/types/Selection';
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
  selection_id?: string;
  selection?: Selection;
  onUpdateNote: (note: Note) => Promise<boolean>;
  onDeleteNote: (note: Note) => Promise<boolean>;
  onStartInspector: (noteId: number) => void;
  defaultColor?: string;
  portalContainer?: HTMLElement;
};

const StickyNote: React.FC<Props> = memo(
  ({
    onUpdateNote,
    onDeleteNote,
    onStartInspector,
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
    selection_id,
    selection,
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
        selection_id,
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
        selection_id,
      ],
    );

    const noteRef = useRef<HTMLDivElement>(null);
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

    // Element tracking for pinned notes
    const { rect: trackedRect, elementFound, resolveFailed } = useElementTracker(selection);
    const isPinned = !!selection;
    const showElementLostWarning = isPinned && resolveFailed;

    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPositionX, setDragStartPositionX] = useState(0);
    const [dragStartPositionY, setDragStartPositionY] = useState(0);

    const pinnedResult = useMemo(() => {
      if (!isPinned || !elementFound || !trackedRect) return null;
      return computePinnedPlacement({
        elementRect: trackedRect,
        noteWidth: is_open ? (editWidth ?? 300) : 160,
        noteHeight: is_open ? (editHeight ?? 180) : 32,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    }, [isPinned, elementFound, trackedRect, editHeight, editWidth, is_open]);

    const displayPositionX = useMemo(() => {
      if (pinnedResult) return pinnedResult.x;
      return editPositionX ?? initialPositionX();
    }, [pinnedResult, editPositionX]);

    const displayPositionY = useMemo(() => {
      if (pinnedResult) return pinnedResult.y;
      return editPositionY ?? initialPositionY();
    }, [pinnedResult, editPositionY]);

    // Animate placement direction changes by temporarily adding CSS transition to the DOM node
    const prevPlacementRef = useRef<Placement | null>(null);
    useEffect(() => {
      const el = noteRef.current;
      const current = pinnedResult?.placement ?? null;
      const prev = prevPlacementRef.current;
      prevPlacementRef.current = current;

      if (!el || prev === null || current === null || prev === current) return;

      el.style.transition = 'transform 0.2s ease-out';
      const timer = setTimeout(() => {
        el.style.transition = '';
      }, 200);
      return () => {
        clearTimeout(timer);
        if (el) el.style.transition = '';
      };
    }, [pinnedResult?.placement]);

    // Pinned notes use fixed positioning when element is tracked (viewport coords)
    const effectiveIsFixed = isPinned && elementFound ? true : is_fixed;
    const isPinnedAndTracking = isPinned && elementFound;

    // Highlight the pinned element only on hover or while editing
    useSelectionHighlight(trackedRect, isPinnedAndTracking && (isHovered || isEditing || isDragging));

    const onEditDone = useCallback(async () => {
      // When pinned and tracking element, don't overwrite position (it's managed by the tracker)
      const positionUpdate = isPinnedAndTracking ? {} : { position_x: editPositionX, position_y: editPositionY };
      const isUpdated = await onUpdateNote({
        ...defaultNote,
        title: editTitle,
        description: editDescription,
        ...positionUpdate,
        width: editWidth,
        height: editHeight,
      });
      if (isUpdated) {
        setIsEditing(false);
        setIsInputFocused(false);
      } else {
        const message =
          (editDescription?.length ?? 0) > 2000 ? t(I18N.SAVE_ERROR_WORD_MAXIMUM) : t(I18N.SAVE_ERROR_MSG_2);
        alert(`${t(I18N.SAVE_ERROR)}${message}`);
      }
    }, [
      defaultNote,
      editTitle,
      editDescription,
      editPositionX,
      editPositionY,
      editWidth,
      editHeight,
      onUpdateNote,
      isPinnedAndTracking,
    ]);

    const onEditCancel = useCallback(() => {
      setEditTitle(title);
      setEditDescription(description);
      setIsEditing(false);
      setIsInputFocused(false);
    }, [title, description, setEditTitle, setEditDescription]);

    const onClickFixedButton = useCallback(() => {
      const { positionX, positionY } = getFixedPosition(!is_fixed);
      setEditPosition(positionX, positionY);
      // Detach from element when toggling fixed mode
      onUpdateNote({
        ...defaultNote,
        is_fixed: !is_fixed,
        position_x: positionX,
        position_y: positionY,
        selection_id: undefined,
      });
    }, [getFixedPosition, is_fixed, setEditPosition, onUpdateNote, defaultNote]);

    const onDetachFromElement = useCallback(() => {
      // Detach: save current display position as fixed coords and clear selection
      setEditPosition(displayPositionX, displayPositionY);
      onUpdateNote({
        ...defaultNote,
        selection_id: undefined,
        is_fixed: true,
        position_x: displayPositionX,
        position_y: displayPositionY,
      });
    }, [defaultNote, displayPositionX, displayPositionY, setEditPosition, onUpdateNote]);

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
        if (e.key === 'Escape' || e.key === 'Esc') onEditCancel();
        else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onEditDone();
      },
      [onEditCancel, onEditDone],
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
      const node = noteRef.current;
      if (isEditing) {
        window.addEventListener('beforeunload', onBeforeUnload, false);
        node?.addEventListener('keydown', onKeyDownEditing as EventListener, false);
      }
      return () => {
        window.removeEventListener('beforeunload', onBeforeUnload, false);
        node?.removeEventListener('keydown', onKeyDownEditing as EventListener, false);
      };
    }, [isEditing, onBeforeUnload, onKeyDownEditing]);

    const draggableCoreProps = {
      scale: 1,
      enableUserSelectHack: false,
      disabled: isPinnedAndTracking,
      onStart: (_: unknown, data: { x: number; y: number }) => {
        setEnableOpenButtonThreshold(0);
        setIsDragging(true);
        setDragStartPositionX(displayPositionX - data.x);
        setDragStartPositionY(displayPositionY - data.y);
        document.body.style.userSelect = 'none';
      },
      onDrag: (_: unknown, data: { x: number; y: number }) => {
        if (isInputFocused) return;
        setEnableOpenButtonThreshold(prev => prev + 1);
        setEditPosition(dragStartPositionX + data.x, dragStartPositionY + data.y);
      },
      onStop: () => {
        setIsDragging(false);
        document.body.style.userSelect = '';
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
    const noteFixedStyle = effectiveIsFixed ? 'fixed shadow-lg' : 'absolute shadow-md';
    const noteForwardStyle = isDragging || isEditing ? 'z-[1252]' : effectiveIsFixed ? 'z-[1251]' : 'z-[1250]';

    const hoverHandlers = {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

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
          }}
          {...hoverHandlers}>
          <DraggableCore {...draggableCoreProps} nodeRef={noteRef}>
            <div className="flex cursor-default items-center gap-1 p-1">
              <button
                onClick={() => onClickOpenButton(true)}
                title={title}
                className="pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-black/10">
                <LogoIcon className="pointer-events-none h-6 w-6" />
              </button>
              {showElementLostWarning && (
                <HiExclamationTriangle className="h-4 w-4 shrink-0 text-amber-500" title="Element not found" />
              )}
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
        }}
        {...hoverHandlers}>
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
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
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
                {showElementLostWarning && (
                  <HiExclamationTriangle
                    className="mr-1 mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    title="Element not found"
                  />
                )}
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
            {/* Element lost warning banner */}
            {showElementLostWarning && !title && (
              <div className="flex items-center gap-1 px-2 pt-1.5 text-xs text-amber-600">
                <HiExclamationTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Element not found</span>
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
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
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
              onStartInspector={id !== undefined ? () => onStartInspector(id) : undefined}
              onDetachFromElement={onDetachFromElement}
              isPinnedAndTracking={isPinnedAndTracking}
              portalContainer={portalContainer}
            />
          )}
        </div>

        {/* Resize handler */}
        <DraggableCore
          enableUserSelectHack={false}
          onStart={(_, data) => {
            setDragStartPositionX(editWidth - data.x);
            setDragStartPositionY(editHeight - data.y);
            document.body.style.userSelect = 'none';
          }}
          onDrag={(_, data) => setEditSize(dragStartPositionX + data.x, dragStartPositionY + data.y)}
          onStop={() => {
            document.body.style.userSelect = '';
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
