import * as sender from '@/message/sender/popup';
import { SubdirectoryArrowLeftIcon } from '@/shared/components/Icon';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useEffect, useState } from 'react';
import { Plus, Menu, Trash2, RefreshCw, ChevronRight, SquareDashedMousePointer } from 'lucide-react';
import type { Note } from '@/shared/types/Note';
import type { Selection } from '@/shared/types/Selection';

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();

  const onClickAddNote = () => {
    if (currentTab) {
      sender
        .sendCreateNote(currentTab)
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
          setIsEnabled(false);
        })
        .finally(() => {
          window.close();
        });
    }
  };

  const onClickAddPinnedNote = () => {
    if (currentTab) {
      sender
        .sendActivateInspector(currentTab)
        .then(() => {
          window.close();
        })
        .catch(() => {
          setIsEnabled(false);
        });
    }
  };

  const onClickNotesButton = () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  };

  const onClickDelete = (note: Note) => {
    const { title } = note;
    if (currentTab && confirm(`"${title ?? t(I18N.NOTE)}" ${t(I18N.CONFIRM_REMOVE_NEXT_NOTE)}`)) {
      sender
        .sendDeleteNote(currentTab, note)
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
          setIsEnabled(false);
        });
    }
  };

  const onClickNote = (note: Note) => {
    if (currentTab) {
      sender
        .sendScrollToTargetNote(currentTab, note)
        .then(() => {
          setIsEnabled(true);
        })
        .catch(() => {
          setIsEnabled(false);
        });
    }
  };

  const onClickResetPosition = (note: Note) => {
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, {
          ...note,
          position_x: undefined,
          position_y: undefined,
          is_fixed: true,
          is_open: true,
        })
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
          setIsEnabled(false);
        });
    }
  };

  const onClickResetPinnedNote = (note: Note) => {
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, {
          ...note,
          position_x: undefined,
          position_y: undefined,
          selection_id: undefined,
          is_fixed: true,
          is_open: true,
        })
        .then(({ notes }) => {
          if (notes) setNotes(notes);
          setIsEnabled(true);
        })
        .catch(() => {
          setIsEnabled(false);
        });
    }
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab && tab.url) {
        setCurrentTab(tab);
        sender
          .fetchAllNotes(tab)
          .then(data => {
            const { notes, selections: sels } = data;
            if (notes) setNotes(notes);
            if (sels) setSelections(new Map(sels.map(s => [s.id, s])));
            setIsEnabled(true);
          })
          .catch(() => {
            setIsEnabled(false);
          });
      } else {
        setIsEnabled(false);
      }
    });
  }, []);

  const isPinned = (note: Note) => !!note.selection_id;
  const isScrollable = (note: Note) => !note.is_fixed || isPinned(note);

  const getNoteLabel = (note: Note) => {
    return note.title || note.description || t(I18N.NEW_NOTE_TITLE);
  };

  const getSelectionText = (note: Note): string | undefined => {
    if (!note.selection_id) return undefined;
    return selections.get(note.selection_id)?.text;
  };

  return (
    <div style={{ width: '320px', minHeight: '200px' }}>
      {/* Header */}
      <header className="sticky top-0 flex items-center border-b border-black/10 bg-white p-4">
        <div className="flex flex-1 gap-2">
          <button
            onClick={onClickAddNote}
            disabled={!isEnabled}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 disabled:opacity-50">
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={onClickAddPinnedNote}
            disabled={!isEnabled}
            title={t(I18N.ADD_NOTE_FROM_ELEMENT)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 disabled:opacity-50">
            <SquareDashedMousePointer className="h-5 w-5" />
          </button>
        </div>
        <div>
          <button
            onClick={onClickNotesButton}
            className="flex h-8 w-8 items-center justify-center rounded p-1 hover:bg-black/5">
            <Menu className="h-5 w-5 text-black/40" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div>
        {!isEnabled && <p className="p-4 text-gray-400">{t(I18N.NOTE_UNAVAILABLE)}</p>}
        {isEnabled && notes.length === 0 && (
          <>
            <p className="flex items-baseline p-4">
              <SubdirectoryArrowLeftIcon className="mx-2 h-8 w-8 rotate-90" />
              <span className="text-xl">{t(I18N.NO_NOTE_CREATED)}</span>
            </p>
            <p className="p-4 text-gray-400">{t(I18N.NO_NOTE_CREATED_OPTION)}</p>
          </>
        )}
        {isEnabled && notes.length !== 0 && (
          <ul className="list-none pb-4">
            {notes.map(note => (
              <li key={note.id} className="flex justify-between border-b border-black/10">
                <button
                  type="button"
                  className={`flex flex-1 items-center gap-1.5 overflow-hidden border-none bg-transparent p-4 pr-1 text-left ${
                    isScrollable(note) ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'
                  }`}
                  onClick={() => isScrollable(note) && onClickNote(note)}>
                  {isPinned(note) && (
                    <SquareDashedMousePointer className="mt-0.5 h-3.5 w-3.5 shrink-0 self-start text-emerald-500" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <span className="block truncate">{getNoteLabel(note)}</span>
                    {getSelectionText(note) && (
                      <span className="mt-1 block truncate border-l-2 border-black/20 pl-2 text-xs text-black/40">
                        {getSelectionText(note)}
                      </span>
                    )}
                  </div>
                  {isScrollable(note) && <ChevronRight className="h-4 w-4 shrink-0 text-black/50" />}
                </button>
                <div className="flex items-center p-4">
                  <button
                    onClick={() => (isPinned(note) ? onClickResetPinnedNote(note) : onClickResetPosition(note))}
                    className="mx-2 rounded p-1 hover:bg-black/10"
                    title={t(I18N.RESET_POSITION)}>
                    <RefreshCw className="h-4 w-4 text-black/50" />
                  </button>
                  <button onClick={() => onClickDelete(note)} className="mx-2 rounded p-1 hover:bg-black/10">
                    <Trash2 className="h-4 w-4 text-black/50" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Popup;
