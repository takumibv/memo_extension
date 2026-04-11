import { ColorPicker } from '@/shared/components/ColorPicker';
import { PalletIcon } from '@/shared/components/Icon';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/Popover';
import { useClipboard } from '@/shared/hooks/useClipboard';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { formatDate } from '@/shared/utils/utils';
import { useState } from 'react';
import { SquarePen, Trash2, Clipboard, Check, Filter, SquareDashedMousePointer } from 'lucide-react';
import { getNoteColors } from '@/shared/utils/color';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';

type Props = {
  note: Note;
  pageInfo?: PageInfo;
  selectionText?: string;
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
  selectionText,
  defaultColor,
  onEdit,
  onDelete,
  onUpdateNote,
  onFilterByPage,
}: Props) => {
  const { isSuccessCopy, copyClipboard } = useClipboard();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const bgColor = note.color || defaultColor || '#FFFFFF';
  const { dark, textColor, subTextColor, iconColor, borderColor } = getNoteColors(bgColor);

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
      className="mb-3 rounded-lg p-4"
      style={{ backgroundColor: bgColor, color: textColor, borderWidth: 1, borderColor }}
      onDoubleClick={() => onEdit(note, 'title')}>
      {/* Title */}
      {note.title && <h3 className="mb-2 text-sm font-semibold">{note.title}</h3>}

      {/* Description */}
      {note.description && (
        <p className="mb-3 whitespace-pre-line break-all text-xs" style={{ color: subTextColor }}>
          {note.description}
        </p>
      )}

      {/* Page info (shown when not filtered) */}
      {pageInfo && (
        <div
          className="mb-3 inline-flex items-center rounded text-xs"
          style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            borderWidth: 1,
            borderColor,
          }}>
          <a
            href={pageInfo.page_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-r px-2 py-1 hover:underline"
            style={{ borderRightColor: borderColor }}
            title={pageInfo.page_url}>
            {pageInfo.fav_icon_url && <img src={pageInfo.fav_icon_url} alt="" className="h-3 w-3" />}
            <span className="min-w-0 flex-1 truncate" style={{ color: subTextColor }}>
              {pageInfo.page_title || pageInfo.page_url}
            </span>
          </a>
          <button
            type="button"
            onClick={() => onFilterByPage(pageInfo.id ?? null)}
            className="shrink-0 rounded p-1.5 hover:opacity-70"
            title={t(I18N.THIS_PAGE_NOTE_LIST)}>
            <Filter className="h-3 w-3" style={{ color: iconColor }} />
          </button>
        </div>
      )}

      {/* Selection text */}
      {selectionText && (
        <div className="mb-3 flex items-center gap-1.5 truncate text-xs" style={{ color: subTextColor, opacity: 0.7 }}>
          <SquareDashedMousePointer className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="truncate border-l-2 pl-2" style={{ borderColor }}>
            {selectionText}
          </span>
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
            <SquarePen className="h-4 w-4" style={{ color: iconColor }} />
          </button>
          <button
            type="button"
            onClick={() => copyClipboard(`${note.title || ''}\n${note.description || ''}`)}
            className="rounded p-1 hover:opacity-70"
            title={isSuccessCopy ? t(I18N.COPIED) : t(I18N.COPY)}>
            {isSuccessCopy ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Clipboard className="h-4 w-4" style={{ color: iconColor }} />
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
            <Trash2 className="h-4 w-4" style={{ color: iconColor }} />
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
