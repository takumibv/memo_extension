import { ColorPicker } from '@/shared/components/ColorPicker';
import { PalletIcon } from '@/shared/components/Icon';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/Popover';
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

const isDarkColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
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
  const dark = isDarkColor(bgColor);
  const textColor = dark ? '#f3f4f6' : '#1f2937';
  const subTextColor = dark ? 'rgba(255,255,255,0.6)' : 'rgba(107,114,128,1)';
  const iconColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,1)';
  const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(229,231,235,1)';

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
      className="mb-3 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: bgColor, color: textColor, borderWidth: 1, borderColor }}
      onDoubleClick={() => onEdit(note, 'title')}>
      {/* Title */}
      {note.title && <h3 className="mb-1 truncate text-sm font-semibold">{note.title}</h3>}

      {/* Description (collapsible) */}
      {note.description && (
        <div className="mb-3">
          <p
            className={`whitespace-pre-line text-xs ${isExpanded ? '' : 'max-h-16 overflow-hidden'}`}
            style={{ color: subTextColor }}>
            {note.description}
          </p>
          {(note.description.length > 100 || note.description.split('\n').length > 3) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 flex items-center gap-0.5 text-xs opacity-60 hover:opacity-100">
              <HiChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? t(I18N.CLOSE) : t(I18N.DETAIL)}
            </button>
          )}
        </div>
      )}

      {/* Page info (shown when not filtered) */}
      {pageInfo && (
        <div
          className="mb-3 flex items-center gap-2 rounded px-2 py-1 text-xs"
          style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            borderWidth: 1,
            borderColor,
          }}>
          {pageInfo.fav_icon_url && <img src={pageInfo.fav_icon_url} alt="" className="h-3 w-3" />}
          <span className="min-w-0 flex-1 truncate" style={{ color: subTextColor }}>
            <a
              href={pageInfo.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              title={pageInfo.page_url}>
              {pageInfo.page_title || pageInfo.page_url}
            </a>
          </span>
          <button
            type="button"
            onClick={() => onFilterByPage(pageInfo.id ?? null)}
            className="shrink-0 rounded p-0.5 hover:opacity-70"
            title={t(I18N.SHOW_ALL_NOTE)}>
            <HiFunnel className="h-3 w-3" style={{ color: iconColor }} />
          </button>
          <button
            type="button"
            onClick={() => pageInfo.page_url && onGoToPage(pageInfo.page_url)}
            className="shrink-0 rounded p-0.5 hover:opacity-70"
            title={t(I18N.GO_TO_THIS_PAGE)}>
            <span style={{ color: iconColor }}>↗</span>
          </button>
        </div>
      )}

      {/* Footer: actions + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(note, 'title')}
            className="rounded p-1 hover:opacity-70"
            title={t(I18N.EDIT)}>
            <HiPencilSquare className="h-4 w-4" style={{ color: iconColor }} />
          </button>
          <button
            type="button"
            onClick={() => copyClipboard(`${note.title || ''}\n${note.description || ''}`)}
            className="rounded p-1 hover:opacity-70"
            title={isSuccessCopy ? t(I18N.COPIED) : t(I18N.COPY)}>
            {isSuccessCopy ? (
              <HiCheck className="h-4 w-4 text-green-500" />
            ) : (
              <HiClipboard className="h-4 w-4" style={{ color: iconColor }} />
            )}
          </button>
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <button type="button" className="rounded p-1 hover:opacity-70" title={t(I18N.COLOR)}>
                <PalletIcon className="h-4 w-4" fill={iconColor} />
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              <ColorPicker hasDefault color={note.color} onChangeColor={handleColorChange} />
            </PopoverContent>
          </Popover>
          <button type="button" onClick={handleDelete} className="rounded p-1 hover:opacity-70" title={t(I18N.DELETE)}>
            <HiTrash className="h-4 w-4" style={{ color: iconColor }} />
          </button>
        </div>
        <div className="flex gap-3 text-xs" style={{ color: subTextColor }}>
          {note.created_at && (
            <span>
              {t(I18N.CREATED_AT)} {formatDate(new Date(note.created_at))}
            </span>
          )}
          {note.updated_at && (
            <span>
              {t(I18N.UPDATED_AT)} {formatDate(new Date(note.updated_at))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
