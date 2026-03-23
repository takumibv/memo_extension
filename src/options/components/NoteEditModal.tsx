import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/ui/Dialog';
import { Textarea } from '@/shared/components/ui/Textarea';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { formatDate, isEqualsObject } from '@/shared/utils/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';

type Props = {
  note: Note;
  defaultColor?: string;
  initialFocus?: 'title' | 'description';
  onSave: (note: Note) => Promise<void>;
  onDelete: (note: Note) => Promise<void>;
  onClose: () => void;
};

const isDarkColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
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
  const dark = isDarkColor(bgColor);
  const textColor = dark ? '#f3f4f6' : '#1f2937';
  const subTextColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,1)';
  const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const inputBg = dark ? 'rgba(255,255,255,0.1)' : 'white';

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

  const handleOpenAutoFocus = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (initialFocus === 'description') {
        descRef.current?.focus();
      } else {
        titleRef.current?.focus();
      }
    },
    [initialFocus],
  );

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

  const handleDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = () => {
    if (confirm(`"${note.title || t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
      onDelete(note);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const changed = hasChanges();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!changed) onClose();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col"
        style={{ backgroundColor: bgColor, color: textColor }}
        onPointerDownOutside={e => {
          if (changed) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (changed) e.preventDefault();
        }}
        onOpenAutoFocus={handleOpenAutoFocus}>
        {/* Accessible title (visually used as input) */}
        <DialogTitle className="sr-only">{t(I18N.EDIT)}</DialogTitle>
        <DialogDescription className="sr-only">{t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}</DialogDescription>

        {/* Header (sticky) */}
        <div className="shrink-0 rounded-t-xl p-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <input
            ref={titleRef}
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder={t(I18N.TITLE_SORT_OPTION)}
            className="w-full rounded-lg bg-transparent px-3 py-1 text-lg font-semibold"
            style={{ color: textColor }}
          />
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Description */}
          <div className="p-2">
            <Textarea
              ref={descRef}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder={t(I18N.INPUT_DESCRIPTION_PLACEHOLDER)}
              rows={5}
              className="w-full resize-none rounded-lg border-none bg-transparent px-3 py-1 text-sm shadow-none focus-visible:ring-0"
              style={{ color: textColor, fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

          {/* Details accordion */}
          <div style={{ borderTop: `1px solid ${borderColor}` }}>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between px-5 py-2.5 text-xs hover:bg-black/5"
              style={{ color: subTextColor }}>
              <span>{t(I18N.DETAIL)}</span>
              <HiChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {showDetails && (
              <div className="grid grid-cols-2 gap-3 px-5 pb-4 text-xs">
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.PIN)}</span>
                  <select
                    value={editIsFixed ? 'fixed' : 'unfixed'}
                    onChange={e => setEditIsFixed(e.target.value === 'fixed')}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}>
                    <option value="fixed">{t(I18N.PIN_SELECT_OPTION_FIXED)}</option>
                    <option value="unfixed">{t(I18N.PIN_SELECT_OPTION_UNFIXED)}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.OPEN)}</span>
                  <select
                    value={editIsOpen ? 'open' : 'closed'}
                    onChange={e => setEditIsOpen(e.target.value === 'open')}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}>
                    <option value="open">{t(I18N.OPEN_SELECT_OPTION_NO)}</option>
                    <option value="closed">{t(I18N.OPEN_SELECT_OPTION_YES)}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>X</span>
                  <input
                    type="number"
                    value={editPositionX}
                    onChange={e => setEditPositionX(Number(e.target.value))}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>Y</span>
                  <input
                    type="number"
                    value={editPositionY}
                    onChange={e => setEditPositionY(Number(e.target.value))}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.SIZE_WIDTH)}</span>
                  <input
                    type="number"
                    value={editWidth}
                    onChange={e => setEditWidth(Number(e.target.value))}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.SIZE_HEIGHT)}</span>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={e => setEditHeight(Number(e.target.value))}
                    className="rounded border px-2 py-1"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </label>
                <div className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.CREATED_AT)}</span>
                  <span>{note.created_at ? formatDate(new Date(note.created_at)) : '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ color: subTextColor }}>{t(I18N.UPDATED_AT)}</span>
                  <span>{note.updated_at ? formatDate(new Date(note.updated_at)) : '-'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer (sticky) */}
        <div
          className="flex shrink-0 items-center justify-between rounded-b-xl p-5"
          style={{ borderTop: `1px solid ${borderColor}` }}>
          <button type="button" onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">
            {t(I18N.DELETE)}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={changed ? handleDiscard : onClose}
              className="px-4 py-1.5 text-sm hover:opacity-70"
              style={{ color: subTextColor }}>
              {changed ? t(I18N.DISCARD_CLOSE) : t(I18N.CLOSE)}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!changed}
              className="rounded bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
              {t(I18N.SAVE)}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditModal;
