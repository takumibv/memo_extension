import {
  sendFetchAllNotes,
  sendFetchSetting,
  sendUpdateNote,
  sendDeleteNote,
  sendUpdateDefaultColor,
} from '@/message/sender/options';
import MemoListPage from '@/options/components/MemoListPage';
import OptionsHeader from '@/options/components/OptionsHeader';
import SettingsPage from '@/options/components/SettingsPage';
import { useCallback, useEffect, useState } from 'react';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';
import type { Selection } from '@/shared/types/Selection';
import type { Setting } from '@/shared/types/Setting';

type Tab = 'memos' | 'settings';

const getInitialTab = (): Tab => (window.location.hash === '#init' ? 'settings' : 'memos');

const Options = () => {
  const [tab, setTab] = useState<Tab>(getInitialTab);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [setting, setSetting] = useState<Setting>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  useEffect(() => {
    Promise.all([sendFetchAllNotes(), sendFetchSetting()])
      .then(([notesData, settingData]) => {
        setNotes(notesData.notes || []);
        setPageInfos(notesData.pageInfos || []);
        if (notesData.selections) {
          setSelections(new Map(notesData.selections.map(s => [s.id, s])));
        }
        setSetting(settingData.setting || {});
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateNote = useCallback(async (note: Note) => {
    const result = await sendUpdateNote(note);
    setNotes(result.notes || []);
    setPageInfos(result.pageInfos || []);
  }, []);

  const handleDeleteNote = useCallback(async (note: Note) => {
    const result = await sendDeleteNote(note);
    setNotes(result.notes || []);
    setPageInfos(result.pageInfos || []);
  }, []);

  const handleUpdateDefaultColor = useCallback(async (color: string) => {
    const result = await sendUpdateDefaultColor(color);
    setSetting(result.setting || {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <OptionsHeader
        currentTab={tab}
        onTabChange={newTab => {
          setTab(newTab);
          if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />
      {tab === 'memos' ? (
        <MemoListPage
          notes={notes}
          pageInfos={pageInfos}
          selections={selections}
          defaultColor={setting.default_color}
          isLoading={isLoading}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onPageInfosChange={setPageInfos}
        />
      ) : (
        <SettingsPage
          notes={notes}
          pageInfos={pageInfos}
          setting={setting}
          onUpdateDefaultColor={handleUpdateDefaultColor}
          onNavigateToMemos={() => {
            setTab('memos');
          }}
        />
      )}
    </div>
  );
};

export default Options;
