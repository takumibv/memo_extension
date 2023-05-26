import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useHistory } from "react-router";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import {
  AutoSizer as _AutoSizer,
  List as _List,
  ListProps,
  AutoSizerProps,
  CellMeasurerCache,
  CellMeasurer as _CellMeasurer,
  CellMeasurerProps,
} from "react-virtualized";
import { Note } from "../../types/Note";
import { PageInfo } from "../../types/PageInfo";
import OptionListItem from "../../components/OptionList/OptionListItem";
import { useQuery } from "../../hooks/useRouter";
import {
  SSideNav,
  SSideNavItem,
  SFaviconImage,
  SSideNavItemHeader,
  SSideNavItemTitle,
  SSideNavItemLink,
  SInputWrap,
  SInputIcon,
  SInput,
  SSelectWrap,
  SSelectIcon,
  SSelect,
  SCurrentPageArea,
  SCurrentPageAreaHeader,
  SCurrentPageFaviconImage,
  SCurrentPageTitle,
  SCurrentPageLinkArea,
  SCurrentPageLink,
  SCurrentPageLinkEditButton,
  SPageLinkEditInput,
  SPageLinkEditButton,
  SCardList,
  SCardListItem,
  SNoNoteText,
  SCurrentPageCloseButton,
  SSkeleton,
  SPageLinkEditInputAlert,
} from "./Memos.style";
import {
  GlobalStyle,
  SContainer,
  SMain,
  SMainLeft,
  SMainRight,
  SMainRightInner,
  SMainRightHeader,
} from "./index.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";
import * as sender from "../message/sender/options";
import { msg } from "../../utils";

interface Props extends RouteComponentProps<{}> {}

const List = _List as unknown as React.FC<ListProps>;
const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;
const CellMeasurer = _CellMeasurer as unknown as React.FC<CellMeasurerProps>;

const Memos: React.FC<Props> = () => {
  const [defaultColor, setDefaultColor] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const query = useQuery();
  const history = useHistory();
  const currentPageInfoId = query.get("filter") ? Number(query.get("filter")) : undefined;

  const currentPageInfo = useMemo(() => {
    return pageInfos.find((pageInfo) => pageInfo.id === currentPageInfoId);
  }, [pageInfos, currentPageInfoId]);

  // 絞り込み、ソート済みのメモ一覧
  const filteredNotes = useMemo(() => {
    const targetNotes = (
      currentPageInfoId === undefined
        ? notes
        : notes.filter((note) => note.page_info_id === currentPageInfoId)
    ).filter((note) => searchText === "" || note.title?.includes(searchText) || note.description?.includes(searchText));

    if (sortBy === "updated_at") {
      return [...targetNotes].sort((a, b) =>
        new Date(a?.updated_at ?? "1900/01/01") < new Date(b?.updated_at ?? "1900/01/01") ? 1 : -1
      );
    }
    if (sortBy === "created_at") {
      return [...targetNotes].sort((a, b) =>
        new Date(a?.created_at ?? "1900/01/01") < new Date(b?.created_at ?? "1900/01/01") ? 1 : -1
      );
    }
    if (sortBy === "title") {
      return [...targetNotes].sort((a, b) => ((a?.title ?? "") > (b?.title ?? "") ? 1 : -1));
    }

    return targetNotes;
  }, [searchText, sortBy, notes, currentPageInfoId]);

  const filterPageInfos = useMemo(() => {
    const filteredPageInfos =
      searchText === ""
        ? [...pageInfos]
        : [...pageInfos].filter(
            (pageInfo) =>
              pageInfo.page_url?.includes(searchText) || pageInfo.page_title?.includes(searchText)
          );

    if (sortBy === "updated_at") {
      return [...filteredPageInfos].sort((a, b) =>
        new Date(a?.updated_at ?? "1900/01/01") < new Date(b?.updated_at ?? "1900/01/01") ? 1 : -1
      );
    }
    if (sortBy === "created_at") {
      return [...filteredPageInfos].sort((a, b) =>
        new Date(a?.created_at ?? "1900/01/01") < new Date(b?.created_at ?? "1900/01/01") ? 1 : -1
      );
    }
    if (sortBy === "title") {
      return [...filteredPageInfos].sort((a, b) =>
        (a?.page_title ?? "") > (b?.page_title ?? "") ? 1 : -1
      );
    }

    return filteredPageInfos.reverse();
  }, [searchText, pageInfos, sortBy]);

  const onChangeSort = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  const onClickFilter = (pageInfoId?: number) => {
    window.scrollTo(0, 0);
    pageInfoId ? query.set("filter", `${pageInfoId}`) : query.delete("filter");
    setSearchText("");
    history.push({ search: query.toString() });
  };

  const onUpdate = async (note: Note) => {
    try {
      const page_url = pageInfos.find((p) => p.id === note.page_info_id)?.page_url;
      const { notes, pageInfos: newPageInfos } = await sender.sendUpdateNote(note, page_url);
      notes && setNotes((currentNotes) => {
        const newNotes = [...currentNotes];
        const index = newNotes.findIndex((n) => n.id === note.id);
        newNotes[index] = note;
        return newNotes;
      });
      newPageInfos && setPageInfos(newPageInfos);
      return true;
    } catch (error) {
      return false;
    }
  };

  const onDelete = async (note: Note) => {
    if (confirm(msg("confirm_remove_note_msg"))) {
      try {
        const page_url = pageInfos.find((p) => p.id === note.page_info_id)?.page_url;
        const { notes, pageInfos: newPageInfos } = await sender.sendDeleteNote(note, page_url);
        notes && setNotes(notes);
        newPageInfos && setPageInfos(newPageInfos);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  };

  const onClickLink = async (url: string) => {
    try {
      const [tab] = await chrome.tabs.query({ url, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { active: true });
        // メモが古い場合があるため再読み込みさせる
        await chrome.tabs.reload(tab.id);
      } else {
        await chrome.tabs.create({ url });
      }
    } catch (error) {
      // TODO
      alert(msg("failed_load_page_msg"));
    }
  };

  const [linkEditMode, setLinkEditMode] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<string>("");
  const handleEditLink = () => {
    setEditLink(currentPageInfo?.page_url ?? "");
    setLinkEditMode(true);
  };

  const handleSaveLink = () => {
    if (editLink !== currentPageInfo?.page_url) {
      sender
        .sendUpdatePageInfo({
          ...currentPageInfo,
          page_url: editLink,
        })
        .then(({ pageInfos }) => {
          if (pageInfos) setPageInfos(pageInfos);
        });
    }
    setLinkEditMode(false);
  };

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 50,
      }),
    []
  );

  useEffect(() => {
    setIsLoading(true);
    sender
      .sendFetchAllNotes()
      .then(({ notes, pageInfos }) => {
        notes && setNotes(notes);
        pageInfos && setPageInfos(pageInfos);
      })
      .finally(() => {
        setIsLoading(false);
      });
    sender.sendFetchSetting().then(({ setting }) => {
      setDefaultColor(setting?.default_color ?? "");
    });
  }, []);

  useEffect(() => {
    setLinkEditMode(false);
  }, [currentPageInfoId]);

  return (
    <>
      <GlobalStyle />
      <div className="p-4">
        <SContainer>
          <OptionHeader current="memos" />
          <SMain>
            <SMainLeft>
              <SSideNav>
                <li>
                  <SSideNavItem
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onClickFilter();
                    }}
                    $isActive={currentPageInfoId === undefined}
                  >
                    <SSideNavItemHeader>
                      <SSideNavItemTitle>{msg("show_all_note_msg")}</SSideNavItemTitle>
                    </SSideNavItemHeader>
                  </SSideNavItem>
                </li>
                {filterPageInfos.map((pageInfo) => (
                  <li key={pageInfo.id}>
                    <SSideNavItem
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onClickFilter(pageInfo.id);
                      }}
                      $isActive={pageInfo.id === currentPageInfoId}
                    >
                      <SSideNavItemHeader>
                        <SFaviconImage src={pageInfo.fav_icon_url} />
                        <SSideNavItemTitle>{pageInfo.page_title}</SSideNavItemTitle>
                      </SSideNavItemHeader>
                      <SSideNavItemLink>{pageInfo.page_url}</SSideNavItemLink>
                    </SSideNavItem>
                  </li>
                ))}
              </SSideNav>
            </SMainLeft>
            <SMainRight>
              <SMainRightInner>
                {isLoading && <CardListSkelton />}
                {!isLoading && (
                  <SMainRightHeader>
                    <SInputWrap>
                      <SInputIcon fill="rgba(0,0,0,0.4)" />
                      <SInput
                        placeholder={msg("search_query_msg")}
                        onChange={onChangeSearch}
                        value={searchText}
                        type="text"
                      />
                    </SInputWrap>
                    <SSelectWrap>
                      <SSelectIcon fill="rgba(0,0,0,0.4)" />
                      <SSelect onChange={onChangeSort}>
                        <option value="created_at">{msg("created_at_sort_option")}</option>
                        <option value="updated_at">{msg("updated_at_sort_option")}</option>
                        <option value="title">{msg("title_sort_option")}</option>
                      </SSelect>
                    </SSelectWrap>
                  </SMainRightHeader>
                )}
                {currentPageInfo && (
                  <SCurrentPageArea>
                    <SCurrentPageAreaHeader>
                      <SCurrentPageFaviconImage src={currentPageInfo.fav_icon_url} />
                      <SCurrentPageTitle>{currentPageInfo.page_title}</SCurrentPageTitle>
                      <SCurrentPageCloseButton onClick={() => onClickFilter()}>
                        <XMarkIcon fill="rgba(0, 0, 0, 0.4)" />
                      </SCurrentPageCloseButton>
                    </SCurrentPageAreaHeader>
                    <SCurrentPageLinkArea>
                      {linkEditMode ? (
                        <>
                          <div style={{flex:1}}>
                            <SPageLinkEditInput
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                            />
                            <SPageLinkEditInputAlert>{msg("link_edit_note_msg")}</SPageLinkEditInputAlert>
                          </div>
                          <SPageLinkEditButton onClick={handleSaveLink}>
                            {msg("save_msg")}
                          </SPageLinkEditButton>
                          <SPageLinkEditButton secondary onClick={() => setLinkEditMode(false)}>
                            {msg("cancel_msg")}
                          </SPageLinkEditButton>
                        </>
                      ) : (
                        <>
                          <SCurrentPageLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onClickLink(currentPageInfo.page_url ?? "");
                            }}
                          >
                            {currentPageInfo.page_url}
                          </SCurrentPageLink>
                          <SCurrentPageLinkEditButton onClick={handleEditLink}>
                            <PencilSquareIcon fill="rgba(0, 0, 0, 0.4)" />
                          </SCurrentPageLinkEditButton>
                        </>
                      )}
                    </SCurrentPageLinkArea>
                  </SCurrentPageArea>
                )}
                {!isLoading && filteredNotes.length === 0 && (
                  <SNoNoteText>{msg("no_note_msg")}</SNoNoteText>
                )}
                {!isLoading && filteredNotes.length !== 0 && (
                  <SCardList>
                    <AutoSizer>
                      {({ height, width }: any) => (
                        <List
                          width={width}
                          height={height}
                          rowCount={filteredNotes.length}
                          deferredMeasurementCache={cache}
                          rowHeight={cache.rowHeight}
                          rowRenderer={({ key, parent, index, style }: any) => {
                            const note = filteredNotes[index];

                            return (
                              <CellMeasurer
                                key={note.id}
                                cache={cache}
                                parent={parent}
                                columnIndex={0}
                                rowIndex={index}
                              >
                                {({ measure, registerChild }) => (
                                  <SCardListItem
                                    id={`note-${note.page_info_id}-${note.id}`}
                                    ref={registerChild as any}
                                    style={style}
                                  >
                                    <OptionListItem
                                      note={note}
                                      defaultColor={defaultColor}
                                      showPageInfo={!currentPageInfo}
                                      currentPageInfoId={currentPageInfoId}
                                      pageInfo={pageInfos.find((p) => p.id === note.page_info_id)}
                                      onDelete={onDelete}
                                      onUpdate={onUpdate}
                                      onClickLink={onClickLink}
                                      onClickFilter={onClickFilter}
                                      measure={measure}
                                    />
                                  </SCardListItem>
                                )}
                              </CellMeasurer>
                            );
                          }}
                        />
                      )}
                    </AutoSizer>
                  </SCardList>
                )}
              </SMainRightInner>
            </SMainRight>
          </SMain>
        </SContainer>
      </div>
    </>
  );
};

const CardListSkelton = () => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <SSkeleton
          style={{ borderRadius: "999rem", marginRight: "1rem" }}
          variant="rounded"
          width={"100%"}
          height={36}
        />
        <SSkeleton variant="rounded" width={192} height={36} />
      </div>
      <SSkeleton variant="rounded" width={"100%"} height={100} />
      <SSkeleton variant="rounded" width={"100%"} height={100} />
      <SSkeleton variant="rounded" width={"100%"} height={100} />
    </>
  );
};

export default Memos;
