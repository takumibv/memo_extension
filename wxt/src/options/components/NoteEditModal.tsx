import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { formatDate, isEqualsObject } from '@/shared/utils/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiChevronDown, HiXMark } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';

type Props = {
  note: Note;
  defaultColor?: string;
  initialFocus?: 'title' | 'description';
  onSave: (note: Note) => Promise<void>;
  onDelete: (note: Note) => Promise<void>;
  onClose: () => void;
};

const NoteEditModal = ({ note, defaultColor, initialFocus = 'title', onSave, onDelete, onClose }: Props) => {
  const [editTitle, setEditTitle] = useState(note.title || '');
  const [editDescription, setEditDescription] = useState(note.description || '');
  const [editIsFixed, setEditIsFixed] = useState(note.is_fixed ?? true);
  const [editIsOpen, setEditIsOpen] = useState(note.is_open ?? true);
  const [editPositionX, setEditPositionX] = useState(note.position_x ?? 0);
  const [editPositionY, setEditPositionY] = useState(note.position_y ?? 0);
  const [editWidth, setEditWidth] = useState(note.width ?? 300);
  const [editHeight, setEditHeight] = useState(note.height ?? 180);
  const [showDetails, setShowDetails] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const bgColor = note.color || defaultColor || '#FFFFFF';

  const hasChanges = useCallback(() => {
    const edited: Partial<Note> = {
      title: editTitle,
      description: editDescription,
      is_fixed: editIsFixed,
      is_open: editIsOpen,
      position_x: editPositionX,
      position_y: editPositionY,
      width: editWidth,
      height: editHeight,
    };
    const original: Partial<Note> = {
      title: note.title || '',
      description: note.description || '',
      is_fixed: note.is_fixed ?? true,
      is_open: note.is_open ?? true,
      position_x: note.position_x ?? 0,
      position_y: note.position_y ?? 0,
      width: note.width ?? 300,
      height: note.height ?? 180,
    };
    return !isEqualsObject(edited, original);
  }, [editTitle, editDescription, editIsFixed, editIsOpen, editPositionX, editPositionY, editWidth, editHeight, note]);

  useEffect(() => {
    if (initialFocus === 'description') {
      descRef.current?.focus();
    } else {
      titleRef.current?.focus();
    }
  }, [initialFocus]);

  const handleSave = useCallback(async () => {
    await onSave({
      ...note,
      title: editTitle,
      description: editDescription,
      is_fixed: editIsFixed,
      is_open: editIsOpen,
      position_x: editPositionX,
      position_y: editPositionY,
      width: editWidth,
      height: editHeight,
    });
  }, [
    onSave,
    note,
    editTitle,
    editDescription,
    editIsFixed,
    editIsOpen,
    editPositionX,
    editPositionY,
    editWidth,
    editHeight,
  ]);

  const handleClose = useCallback(() => {
    if (hasChanges()) {
      if (!confirm(t('discard_close_msg'))) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const handleDelete = () => {
    if (confirm(`"${note.title || t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
      onDelete(note);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to save, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleClose]);

  const changed = hasChanges();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - cursor default */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={handleClose}
        aria-label="Close modal"
      />
      {/* Modal content */}
      <div className="relative w-full max-w-lg rounded-xl shadow-2xl" style={{ backgroundColor: bgColor }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 p-4">
          <input
            ref={titleRef}
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder={t(I18N.TITLE_SORT_OPTION)}
            className="flex-1 bg-transparent text-lg font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button type="button" onClick={handleClose} className="rounded p-1 hover:bg-black/10">
            <HiXMark className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <div className="p-4">
          <textarea
            ref={descRef}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder={t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}
            rows={8}
            className="w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Details accordion */}
        <div className="border-t border-black/10">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between px-4 py-2 text-xs text-gray-500 hover:bg-black/5">
            <span>{t(I18N.DETAIL)}</span>
            <HiChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>

          {showDetails && (
            <div className="grid grid-cols-2 gap-3 px-4 pb-4 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.PIN)}</span>
                <select
                  value={editIsFixed ? 'fixed' : 'unfixed'}
                  onChange={e => setEditIsFixed(e.target.value === 'fixed')}
                  className="rounded border border-gray-300 bg-white px-2 py-1">
                  <option value="fixed">{t(I18N.PIN_SELECT_OPTION_FIXED)}</option>
                  <option value="unfixed">{t(I18N.PIN_SELECT_OPTION_UNFIXED)}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.OPEN)}</span>
                <select
                  value={editIsOpen ? 'open' : 'closed'}
                  onChange={e => setEditIsOpen(e.target.value === 'open')}
                  className="rounded border border-gray-300 bg-white px-2 py-1">
                  <option value="open">{t(I18N.OPEN_SELECT_OPTION_NO)}</option>
                  <option value="closed">{t(I18N.OPEN_SELECT_OPTION_YES)}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">X</span>
                <input
                  type="number"
                  value={editPositionX}
                  onChange={e => setEditPositionX(Number(e.target.value))}
                  className="rounded border border-gray-300 bg-white px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">Y</span>
                <input
                  type="number"
                  value={editPositionY}
                  onChange={e => setEditPositionY(Number(e.target.value))}
                  className="rounded border border-gray-300 bg-white px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.SIZE_WIDTH)}</span>
                <input
                  type="number"
                  value={editWidth}
                  onChange={e => setEditWidth(Number(e.target.value))}
                  className="rounded border border-gray-300 bg-white px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.SIZE_HEIGHT)}</span>
                <input
                  type="number"
                  value={editHeight}
                  onChange={e => setEditHeight(Number(e.target.value))}
                  className="rounded border border-gray-300 bg-white px-2 py-1"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.CREATED_AT)}</span>
                <span className="text-gray-700">{note.created_at ? formatDate(new Date(note.created_at)) : '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">{t(I18N.UPDATED_AT)}</span>
                <span className="text-gray-700">{note.updated_at ? formatDate(new Date(note.updated_at)) : '-'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: buttons */}
        <div className="flex items-center justify-between border-t border-black/10 p-4">
          <button type="button" onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">
            {t(I18N.DELETE)}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800">
              {t(I18N.CLOSE)}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!changed}
              className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
              {t(I18N.SAVE)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditModal;
