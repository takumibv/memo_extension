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
  GlobalStyle,
  SContainer,
  SMain,
  SMainLeft,
  SSideNav,
  SSideNavItem,
  SFaviconImage,
  SSideNavItemHeader,
  SSideNavItemTitle,
  SSideNavItemLink,
  SMainRight,
  SMainRightInner,
  SMainRightHeader,
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
} from "./Options.style";
import OptionHeader from "../../components/OptionHeader/OptionHeader";
import * as sender from "../message/sender/options";

interface Props extends RouteComponentProps<{}> {}

const List = _List as unknown as React.FC<ListProps>;
const AutoSizer = _AutoSizer as unknown as React.FC<AutoSizerProps>;
const CellMeasurer = _CellMeasurer as unknown as React.FC<CellMeasurerProps>;

const Options: React.FC<Props> = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const query = useQuery();
  const history = useHistory();
  const currentPageInfoId = query.get("filter") ? Number(query.get("filter")) : undefined;

  const currentPageInfo = useMemo(() => {
    return pageInfos.find((pageInfo) => pageInfo.id === currentPageInfoId);
  }, [pageInfos, currentPageInfoId]);

  const filteredNotes = useMemo(() => {
    const targetNotes = (
      currentPageInfoId === undefined
        ? notes
        : notes.filter((note) => note.page_info_id === currentPageInfoId)
    ).filter((note) => note.title?.includes(searchText) || note.description?.includes(searchText));

    if (sortBy === "updated_at") {
      return [...targetNotes].sort((a, b) =>
        new Date(a?.updated_at ?? "") < new Date(b?.updated_at ?? "") ? 1 : -1
      );
    }
    if (sortBy === "created_at") {
      return [...targetNotes].sort((a, b) =>
        new Date(a?.created_at ?? "") < new Date(b?.created_at ?? "") ? 1 : -1
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
    return filteredPageInfos.reverse();
  }, [searchText, pageInfos]);

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
      notes && setNotes(notes);
      newPageInfos && setPageInfos(newPageInfos);
      return true;
    } catch (error) {
      return false;
    }
  };

  const onDelete = async (note: Note) => {
    if (confirm("削除してもよろしいですか？")) {
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
    const [tab] = await chrome.tabs.query({ url, currentWindow: true });
    if (tab?.id) {
      try {
        console.log("chrome.tabs.query === ", tab);
        await chrome.tabs.update(tab.id, { active: true });
        // メモが古い場合があるため再読み込みさせる
        await chrome.tabs.reload(tab.id);
      } catch (error) {
        // TODO
        console.log("error: ", error);
      }
    } else {
      await chrome.tabs.create({ url });
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
  }, []);

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
                      <SSideNavItemTitle>すべてのメモ</SSideNavItemTitle>
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
                        placeholder="検索"
                        onChange={onChangeSearch}
                        value={searchText}
                        type="text"
                      />
                    </SInputWrap>
                    <SSelectWrap>
                      <SSelectIcon fill="rgba(0,0,0,0.4)" />
                      <SSelect onChange={onChangeSort}>
                        <option value="updated_at">更新日</option>
                        <option value="created_at">作成日</option>
                        <option value="title">タイトル</option>
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
                          <SPageLinkEditInput
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                          />
                          <SPageLinkEditButton onClick={handleSaveLink}>保存</SPageLinkEditButton>
                          <SPageLinkEditButton secondary onClick={() => setLinkEditMode(false)}>
                            キャンセル
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
                  <SNoNoteText>メモがありません。</SNoNoteText>
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
                                key={key}
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
                                      showPageInfo={!currentPageInfo}
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

export default Options;
