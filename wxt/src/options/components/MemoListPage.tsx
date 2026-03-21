import NoteCard from '@/options/components/NoteCard';
import NoteEditModal from '@/options/components/NoteEditModal';
import Sidebar from '@/options/components/Sidebar';
import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState } from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import type { Note } from '@/shared/types/Note';
import type { PageInfo } from '@/shared/types/PageInfo';

type SortKey = 'updated_at' | 'created_at' | 'title';

type Props = {
  notes: Note[];
  pageInfos: PageInfo[];
  defaultColor?: string;
  isLoading: boolean;
  onUpdateNote: (note: Note) => Promise<void>;
  onDeleteNote: (note: Note) => Promise<void>;
};

const MemoListPage = ({ notes, pageInfos, defaultColor, isLoading, onUpdateNote, onDeleteNote }: Props) => {
  const [filterPageId, setFilterPageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const saved = localStorage.getItem('memo_ext_sort_key');
    return saved === 'created_at' || saved === 'title' ? saved : 'updated_at';
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editFocus, setEditFocus] = useState<'title' | 'description'>('title');
  const parentRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    localStorage.setItem('memo_ext_sort_key', key);
  };

  // Find current filter page info
  const filterPageInfo = useMemo(
    () => (filterPageId ? pageInfos.find(p => p.id === filterPageId) : undefined),
    [filterPageId, pageInfos],
  );

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by page
    if (filterPageId) {
      result = result.filter(n => n.page_info_id === filterPageId);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => {
        const noteMatch = (n.title || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q);
        if (noteMatch) return true;
        const pi = pageInfos.find(p => p.id === n.page_info_id);
        return (pi?.page_title || '').toLowerCase().includes(q) || (pi?.page_url || '').toLowerCase().includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortKey === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      const dateA = sortKey === 'updated_at' ? a.updated_at : a.created_at;
      const dateB = sortKey === 'updated_at' ? b.updated_at : b.created_at;
      return (dateB || '').localeCompare(dateA || '');
    });

    return result;
  }, [notes, filterPageId, searchQuery, sortKey, pageInfos]);

  // Pages that have notes (for sidebar)
  const activePageInfos = useMemo(
    () => pageInfos.filter(pi => notes.some(n => n.page_info_id === pi.id)),
    [pageInfos, notes],
  );

  const virtualizer = useVirtualizer({
    count: filteredNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  });

  const handleEditNote = (note: Note, focus: 'title' | 'description' = 'title') => {
    setEditingNote(note);
    setEditFocus(focus);
  };

  const handleSaveNote = async (note: Note) => {
    await onUpdateNote(note);
    setEditingNote(null);
  };

  const handleDeleteFromModal = async (note: Note) => {
    await onDeleteNote(note);
    setEditingNote(null);
  };

  // Navigate to page URL
  const handleGoToPage = (url: string) => {
    chrome.tabs.query({ url, currentWindow: true }, tabs => {
      if (tabs.length > 0 && tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        pageInfos={activePageInfos}
        filterPageId={filterPageId}
        noteCountByPage={notes.reduce(
          (acc, n) => {
            const pid = n.page_info_id;
            if (pid) acc[pid] = (acc[pid] || 0) + 1;
            return acc;
          },
          {} as Record<number, number>,
        )}
        totalNoteCount={notes.length}
        onFilter={setFilterPageId}
      />

      {/* Main area */}
      <main className="ml-64 flex-1 p-6">
        {/* Search + Sort bar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t(I18N.SEARCH_QUERY)}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <select
            value={sortKey}
            onChange={e => handleSortChange(e.target.value as SortKey)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none">
            <option value="updated_at">{t(I18N.UPDATED_AT_SORT_OPTION)}</option>
            <option value="created_at">{t(I18N.CREATED_AT_SORT_OPTION)}</option>
            <option value="title">{t(I18N.TITLE_SORT_OPTION)}</option>
          </select>
        </div>

        {/* Current filter page info */}
        {filterPageInfo && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
            {filterPageInfo.fav_icon_url && <img src={filterPageInfo.fav_icon_url} alt="" className="h-4 w-4" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{filterPageInfo.page_title}</p>
              <p className="truncate text-xs text-gray-400">{filterPageInfo.page_url}</p>
            </div>
            <button type="button" onClick={() => setFilterPageId(null)} className="rounded p-1 hover:bg-gray-100">
              <HiXMark className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Note list */}
        {filteredNotes.length === 0 ? (
          <p className="py-8 text-center text-gray-400">{t(I18N.NO_NOTE)}</p>
        ) : (
          <div ref={parentRef} className="h-[calc(100vh-10rem)] overflow-y-auto">
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map(virtualItem => {
                const note = filteredNotes[virtualItem.index];
                if (!note) return null;
                const pageInfo = pageInfos.find(p => p.id === note.page_info_id);
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}>
                    <NoteCard
                      note={note}
                      pageInfo={!filterPageId ? pageInfo : undefined}
                      defaultColor={defaultColor}
                      onEdit={handleEditNote}
                      onDelete={onDeleteNote}
                      onUpdateNote={onUpdateNote}
                      onFilterByPage={setFilterPageId}
                      onGoToPage={handleGoToPage}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Edit modal */}
      {editingNote && (
        <NoteEditModal
          note={editingNote}
          defaultColor={defaultColor}
          initialFocus={editFocus}
          onSave={handleSaveNote}
          onDelete={handleDeleteFromModal}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
};

export default MemoListPage;
