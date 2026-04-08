import { t } from '@/shared/i18n/i18n';
import { I18N } from '@/shared/i18n/keys';
import { useEffect, useRef } from 'react';
import type { PageInfo } from '@/shared/types/PageInfo';

type Props = {
  pageInfos: PageInfo[];
  filterPageId: number | null;
  noteCountByPage: Record<number, number>;
  totalNoteCount: number;
  scrollToActive: boolean;
  onFilter: (pageId: number | null) => void;
};

const Sidebar = ({ pageInfos, filterPageId, noteCountByPage, totalNoteCount, scrollToActive, onFilter }: Props) => {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (scrollToActive) {
      activeRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [filterPageId, scrollToActive]);

  return (
    <aside className="fixed left-0 top-11 flex h-[calc(100vh-2.75rem)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-4">
      <button
        ref={filterPageId === null ? activeRef : undefined}
        type="button"
        onClick={() => onFilter(null)}
        className={`flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors ${
          filterPageId === null ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
        }`}>
        <span className="flex-1">{t(I18N.SHOW_ALL_NOTE)}</span>
        <span className="text-xs text-gray-400">{totalNoteCount}</span>
      </button>

      <div className="border-t border-gray-100" />

      {pageInfos.map(pi => (
        <button
          key={pi.id}
          ref={filterPageId === pi.id ? activeRef : undefined}
          type="button"
          onClick={() => onFilter(pi.id ?? null)}
          className={`flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors ${
            filterPageId === pi.id ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
          }`}>
          {pi.fav_icon_url && <img src={pi.fav_icon_url} alt="" className="h-4 w-4 shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{pi.page_title || pi.page_url}</p>
            <p className="truncate text-xs text-gray-400">{pi.page_url}</p>
          </div>
          <span className="text-xs text-gray-400">{noteCountByPage[pi.id ?? 0] || 0}</span>
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
