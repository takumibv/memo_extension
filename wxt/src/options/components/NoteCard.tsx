import { ColorPicker } from '@/shared/components/ColorPicker';
import { PalletIcon } from '@/shared/components/Icon';
import { useClipboard } from '@/shared/hooks/useClipboard';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { formatDate } from '@/shared/utils/utils';
import { useState } from 'react';
import { HiPencilSquare, HiTrash, HiClipboard, HiCheck, HiFunnel, HiChevronDown } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';

type Props = {
  note: Note;
  pageInfo?: PageInfo;
  defaultColor?: string;
  onEdit: (note: Note, focus?: 'title' | 'description') => void;
  onDelete: (note: Note) => Promise<void>;
  onUpdateNote: (note: Note) => Promise<void>;
  onFilterByPage: (pageId: number | null) => void;
  onGoToPage: (url: string) => void;
};

const NoteCard = ({
  note,
  pageInfo,
  defaultColor,
  onEdit,
  onDelete,
  onUpdateNote,
  onFilterByPage,
  onGoToPage,
}: Props) => {
  const { isSuccessCopy, copyClipboard } = useClipboard();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const bgColor = note.color || defaultColor || '#FFFFFF';

  const handleDelete = () => {
    if (confirm(`"${note.title || t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
      onDelete(note);
    }
  };

  const handleColorChange = (color: string) => {
    onUpdateNote({ ...note, color });
    setShowColorPicker(false);
  };

  return (
    <div
      className="mb-3 rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: bgColor }}
      onDoubleClick={() => onEdit(note, 'title')}>
      {/* Title */}
      <h3 className="mb-1 truncate text-sm font-semibold text-gray-800">{note.title || t(I18N.NEW_NOTE_TITLE)}</h3>

      {/* Description (collapsible) */}
      {note.description && (
        <div className="mb-3">
          <p className={`whitespace-pre-line text-xs text-gray-600 ${isExpanded ? '' : 'max-h-16 overflow-hidden'}`}>
            {note.description}
          </p>
          {(note.description.length > 100 || note.description.split('\n').length > 3) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600">
              <HiChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? t(I18N.CLOSE) : '...'}
            </button>
          )}
        </div>
      )}

      {/* Page info (shown when not filtered) */}
      {pageInfo && (
        <div className="mb-3 flex items-center gap-2 rounded border border-gray-200/50 bg-white/50 px-2 py-1 text-xs text-gray-500">
          {pageInfo.fav_icon_url && <img src={pageInfo.fav_icon_url} alt="" className="h-3 w-3" />}
          <a
            href={pageInfo.page_url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate hover:underline"
            title={pageInfo.page_url}>
            {pageInfo.page_title || pageInfo.page_url}
          </a>
          <button
            type="button"
            onClick={() => onFilterByPage(pageInfo.id ?? null)}
            className="shrink-0 rounded p-0.5 hover:bg-gray-200/50"
            title={t(I18N.SHOW_ALL_NOTE)}>
            <HiFunnel className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => pageInfo.page_url && onGoToPage(pageInfo.page_url)}
            className="shrink-0 rounded p-0.5 hover:bg-gray-200/50"
            title={t(I18N.GO_TO_THIS_PAGE)}>
            ↗
          </button>
        </div>
      )}

      {/* Footer: actions + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(note, 'title')}
            className="rounded p-1 hover:bg-black/10"
            title={t(I18N.EDIT)}>
            <HiPencilSquare className="h-4 w-4 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={() => copyClipboard(`${note.title || ''}\n${note.description || ''}`)}
            className="rounded p-1 hover:bg-black/10"
            title={isSuccessCopy ? t(I18N.COPIED) : t(I18N.COPY)}>
            {isSuccessCopy ? (
              <HiCheck className="h-4 w-4 text-green-500" />
            ) : (
              <HiClipboard className="h-4 w-4 text-gray-500" />
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="rounded p-1 hover:bg-black/10"
              title={t(I18N.COLOR)}>
              <PalletIcon className="h-4 w-4" fill="rgb(107 114 128)" />
            </button>
            {showColorPicker && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <ColorPicker hasDefault color={note.color} onChangeColor={handleColorChange} />
              </div>
            )}
          </div>
          <button type="button" onClick={handleDelete} className="rounded p-1 hover:bg-black/10" title={t(I18N.DELETE)}>
            <HiTrash className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <span className="text-xs text-gray-400">{note.updated_at ? formatDate(new Date(note.updated_at)) : ''}</span>
      </div>
    </div>
  );
};

export default NoteCard;
