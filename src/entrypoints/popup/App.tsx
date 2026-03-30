import * as sender from '@/message/sender/popup';
import { SubdirectoryArrowLeftIcon } from '@/shared/components/Icon';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useEffect, useState } from 'react';
import { HiPlus, HiBars3, HiTrash, HiArrowPath, HiChevronRight, HiCursorArrowRays } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVisible, setIsVisible] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { position_x, position_y, ..._note } = note;
    if (currentTab) {
      sender
        .sendUpdateNote(currentTab, {
          ..._note,
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
            const { notes, isVisible } = data;
            if (notes) setNotes(notes);
            if (isVisible !== undefined) setIsVisible(isVisible);
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

  return (
    <div style={{ width: '320px', minHeight: '200px' }}>
      {/* Header */}
      <header className="sticky top-0 flex items-center border-b border-black/10 bg-white p-4">
        <div className="flex flex-1 gap-2">
          <button
            onClick={onClickAddNote}
            disabled={!isEnabled}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 disabled:opacity-50">
            <HiPlus className="h-5 w-5" />
          </button>
          <button
            onClick={onClickAddPinnedNote}
            disabled={!isEnabled}
            title={t(I18N.ADD_NOTE_FROM_ELEMENT)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 disabled:opacity-50">
            <HiCursorArrowRays className="h-5 w-5" />
          </button>
        </div>
        <div>
          <button
            onClick={onClickNotesButton}
            className="flex h-8 w-8 items-center justify-center rounded p-1 hover:bg-black/5">
            <HiBars3 className="h-5 w-5 text-black/40" />
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
                  className={`flex flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent p-4 pr-1 text-left ${
                    note.is_fixed ? 'cursor-default' : 'cursor-pointer hover:bg-black/5'
                  }`}
                  onClick={() => !note.is_fixed && onClickNote(note)}>
                  <span className="flex-1">{note.title || note.description || t(I18N.NEW_NOTE_TITLE)}</span>
                  {!note.is_fixed && <HiChevronRight className="h-4 w-4 text-black/50" />}
                </button>
                <div className="flex items-center p-4">
                  <button
                    onClick={() => onClickResetPosition(note)}
                    className="mx-2 rounded p-1 hover:bg-black/10"
                    title={t(I18N.RESET_POSITION)}>
                    <HiArrowPath className="h-4 w-4 text-black/50" />
                  </button>
                  <button onClick={() => onClickDelete(note)} className="mx-2 rounded p-1 hover:bg-black/10">
                    <HiTrash className="h-4 w-4 text-black/50" />
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
