import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { BrowserRouter, RouteComponentProps } from "react-router-dom";
import { Route, Switch, useHistory } from "react-router";
import {
  ToBackgroundMessage,
  ToBackgroundMessageMethod,
  ToBackgroundMessageResponse,
} from "../types/Actions";
import { Note } from "../types/Note";
import {
  CREATE_NOTE,
  DELETE_NOTE,
  GET_ALL_NOTES,
  GET_ALL_NOTES_AND_PAGE_INFO,
  OPTIONS,
  POPUP,
  UPDATE_NOTE,
} from "../actions";
import IconButton from "../components/Button/IconButton";
import {
  CopyIcon,
  EditIcon,
  EyeIcon,
  LaunchIcon,
  PlusIcon,
  SearchIcon,
  SortIcon,
  TrashIcon,
} from "../components/Icon";
import { PageInfo } from "../types/PageInfo";
import styled, { createGlobalStyle, css } from "styled-components";
import { resetCSS } from "../resetCSS";
import { formatDate } from "../utils";
import OptionListItem from "../components/OptionList/OptionListItem";
import { useQuery } from "../hooks/useRouter";

interface Props extends RouteComponentProps<{}> {}

const Options: React.VFC<Props> = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const query = useQuery();
  const history = useHistory();
  const currentPageInfoId = query.get("filter") ? Number(query.get("filter")) : undefined;

  const currentPageInfo = useMemo(() => {
    return pageInfos.find((pageInfo) => pageInfo.id === currentPageInfoId);
  }, [pageInfos, currentPageInfoId]);

  const filteredNotes = useMemo(() => {
    const targetNotes =
      currentPageInfoId === undefined
        ? notes
        : notes.filter((note) => note.page_info_id === currentPageInfoId);

    if (sortBy === "updated_at")
      return [...targetNotes].sort((a, b) =>
        new Date(a?.updated_at ?? "") < new Date(b?.updated_at ?? "") ? 1 : -1
      );
    if (sortBy === "created_at")
      return [...targetNotes].sort((a, b) =>
        new Date(a?.created_at ?? "") < new Date(b?.created_at ?? "") ? 1 : -1
      );
    if (sortBy === "title")
      return [...targetNotes].sort((a, b) => ((a?.title ?? "") > (b?.title ?? "") ? 1 : -1));

    return targetNotes;
  }, [sortBy, notes, currentPageInfoId]);

  const sendAction = useCallback(
    (method: ToBackgroundMessageMethod, page_url?: string, targetNote?: Note): Promise<boolean> => {
      console.log("sendMessage ======", method, targetNote);

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage<ToBackgroundMessage, ToBackgroundMessageResponse>(
          {
            method: method,
            senderType: OPTIONS,
            page_url: page_url ?? "",
            targetNote,
          },
          ({ notes, pageInfos, error }) => {
            console.log("response ======", notes, pageInfos, chrome.runtime.lastError);
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else {
              notes && setNotes(notes || []);
              pageInfos && setPageInfos(pageInfos || []);
              resolve(true);
            }
          }
        );
      });
    },
    []
  );

  const onChangeSort = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const onClickFilter = (pageInfoId?: number) => {
    pageInfoId ? query.set("filter", `${pageInfoId}`) : query.delete("filter");
    history.push({ search: query.toString() });
  };

  const onClickAddNote = () => {
    // TODO
    // if (currentTab) sendAction(CREATE_NOTE, "", currentTab);
  };

  const onUpdate = (note: Note) => {
    sendAction(UPDATE_NOTE, pageInfos.find((p) => p.id === note.page_info_id)?.page_url, note);
  };

  const onDelete = (note: Note) => {
    console.log("onDelete", note);
    if (confirm("削除してもよろしいですか？")) {
      sendAction(DELETE_NOTE, pageInfos.find((p) => p.id === note.page_info_id)?.page_url, note);
      return true;
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

  useEffect(() => {
    sendAction(GET_ALL_NOTES_AND_PAGE_INFO);
  }, []);

  return (
    <>
      <GlobalStyle />
      <div className="p-4">
        <SContainer>
          <SMain>
            <SMainLeft>
              <SSideNav>
                <li>
                  <SSideNavItem
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onClickFilter(undefined);
                    }}
                    isActive={currentPageInfoId === undefined}
                  >
                    <SSideNavItemHeader>
                      <SSideNavItemTitle>すべてのノート</SSideNavItemTitle>
                    </SSideNavItemHeader>
                  </SSideNavItem>
                </li>
                {pageInfos.map((pageInfo) => (
                  <li key={pageInfo.id}>
                    <SSideNavItem
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onClickFilter(pageInfo.id);
                      }}
                      isActive={pageInfo.id === currentPageInfoId}
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
              <SMainRightHeader>
                <SInputWrap>
                  <SInputIcon fill="rgba(0,0,0,0.4)" />
                  <SInput type="text" />
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
              {currentPageInfo && (
                <SCurrentPageArea>
                  <SCurrentPageAreaHeader>
                    <SCurrentPageFaviconImage src={currentPageInfo.fav_icon_url} />
                    <SCurrentPageTitle>{currentPageInfo.page_title}</SCurrentPageTitle>
                  </SCurrentPageAreaHeader>
                  <SCurrentPageLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onClickLink(currentPageInfo.page_url ?? "");
                    }}
                  >
                    {currentPageInfo.page_url}
                  </SCurrentPageLink>
                </SCurrentPageArea>
              )}
              {filteredNotes.length === 0 ? (
                <p>メモがありません</p>
              ) : (
                <SCardList>
                  {/* {renderCardList()} */}
                  {filteredNotes.map((note) => (
                    <SCardListItem
                      id={`note-${note.page_info_id}-${note.id}`}
                      key={`note-${note.page_info_id}-${note.id}`}
                    >
                      <OptionListItem
                        note={note}
                        showPageInfo={!currentPageInfo}
                        pageInfo={pageInfos.find((p) => p.id === note.page_info_id)}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onClickLink={onClickLink}
                        onClickFilter={onClickFilter}
                      />
                    </SCardListItem>
                  ))}
                </SCardList>
              )}
            </SMainRight>
          </SMain>
          <SHeader>header</SHeader>
        </SContainer>
      </div>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${resetCSS}

  body {
    font-size: 16px;
  }

  /* TODO dark theme https://medium.com/bigpanda-engineering/dark-theme-with-styled-components-a573dd898e2a */
  @media (prefers-color-scheme: dark) {
    /* body {
      background-color: #000;
      color: #fff;
    } */
  }
`;

const SContainer = styled.div`
  /* height: 100vh; */
  position: relative;
`;

const SHeader = styled.header`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.75em;
  padding: 0 0.75em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fff;
  /* background-color: #4c4722; */
`;

const SMain = styled.div`
  overflow: hidden;
  /* padding: 0 1.125em; */
`;

const SMainLeft = styled.div`
  position: fixed;
  left: 0;
  top: 2.75em;
  bottom: 0;
  overflow-y: auto;
  width: 18em;
  padding-left: 1em;
`;

const SSideNav = styled.ul`
  list-style: none;
  padding: 1.5em 0.75em;
`;

const SSideNavItem = styled.a<{ isActive?: boolean }>`
  display: block;
  border-radius: 0.5em;
  padding: 0.75em;
  margin-bottom: 0.5em;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ isActive }) =>
    isActive &&
    css`
      font-weight: bold;
      cursor: default;
      background-color: #fef3c7;

      &:hover {
        background-color: #fef3c7;
      }
    `}
`;

const SFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;

const SSideNavItemHeader = styled.div`
  word-break: break-all;
  display: flex;
  align-items: center;
`;

const SSideNavItemTitle = styled.p`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 0.875em;
  line-height: 1.25;
  flex: 1;
`;

const SSideNavItemLink = styled.p`
  font-weight: normal;
  font-size: 0.75em;
  margin-top: 0.25em;
  margin-left: 2em;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #aaa;
`;

const SMainRight = styled.main`
  overflow-y: auto;
  padding: 4em 2em 1.5em 19em;
`;

const SMainRightHeader = styled.div`
  display: flex;
  margin-bottom: 0.25em;
`;

const SInputWrap = styled.div`
  position: relative;
  flex: 1;
`;

const SInputIcon = styled(SearchIcon)`
  position: absolute;
  left: 0.75em;
  top: 50%;
  width: 1.25em;
  transform: translateY(-50%);
  pointer-events: none;
`;

const SInput = styled.input`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5em 0.75em 0.5em 2.25em;
  border-radius: 999em;
  width: 100%;

  &:hover,
  &:focus {
    border-color: #fcd34d;
  }
`;

const SSelectWrap = styled.div`
  position: relative;
  margin-left: 0.75em;
  width: 12em;
`;

const SSelectIcon = styled(SortIcon)`
  position: absolute;
  left: 0.5em;
  top: 50%;
  width: 1.25em;
  transform: translateY(-50%);
  pointer-events: none;
`;

const SSelect = styled.select`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5em 0.75em 0.5em 2em;
  border-radius: 0.2em;
  cursor: pointer;
  width: 100%;

  &:hover,
  &:focus {
    border-color: #fcd34d;
  }
`;

const SCurrentPageArea = styled.div`
  margin-top: 0.75em;
  padding: 0.75em;
  border-radius: 0.25em;
  background-color: rgba(0, 0, 0, 0.08);
`;

const SCurrentPageAreaHeader = styled.div`
  display: flex;
  align-items: center;
`;

const SCurrentPageFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;

const SCurrentPageTitle = styled.p`
  font-size: 1em;
  margin-bottom: 0.25em;
`;

const SCurrentPageLink = styled.a`
  margin-left: 1.5em;
  word-break: break-all;
  text-decoration: underline;
  color: #00379e;
`;

const SCardList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 0.25em 0;
  margin: 0 -0.5em;
`;

const SCardListItem = styled.li`
  padding: 0.5em;
  width: 100%;
  /* width: 50%; */
  /* transition: all 0.2s ease-in-out; */
`;

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <Switch>
        <Route exact path="*" component={Options} />
      </Switch>
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById("root")
);
