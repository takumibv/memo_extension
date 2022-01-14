import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle, css } from "styled-components";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Note } from "../../types/Note";
import { formatDate } from "../../utils";
import { CopyIcon, CopySuccessIcon, EditIcon, FilterIcon, LaunchIcon, TrashIcon } from "../Icon";
import IconButton from "../Button/IconButton";
import { PageInfo } from "../../types/PageInfo";
import { Backdrop, Modal, Tooltip } from "@mui/material";
import { ModalUnstyled } from "@mui/base";
import { useClipboard } from "../../hooks/useClipboard";
import Button from "../Button/Button";
import { NoteEditModal } from "../NoteEditModal/NoteEditModal";

type Props = {
  note: Note;
  pageInfo?: PageInfo;
  showPageInfo?: boolean;
  onUpdate: (note: Note) => void;
  onDelete: (note: Note) => void;
  onClickLink: (url: string) => void;
  onClickFilter: (pageInfoId?: number) => void;
};

const OptionListItem: React.VFC<Props> = memo(
  ({ note, pageInfo, showPageInfo, onUpdate, onDelete, onClickLink, onClickFilter }) => {
    const { id, title, description, created_at, updated_at } = note;
    const [openModal, setOpenModal] = useState(false);
    const { isSuccessCopy, copyClipboard } = useClipboard();

    return (
      <>
        <SCard
          onClick={() => {
            console.log("onClick");
            setOpenModal(true);
          }}
        >
          <SCardHeader>
            <SCardTitle>{title}</SCardTitle>
          </SCardHeader>
          <SCardDescription>
            <SCardDescriptionText>{description}</SCardDescriptionText>
          </SCardDescription>
          {showPageInfo && pageInfo && (
            <SPageInfoWrap>
              <SPageInfo
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickLink(pageInfo.page_url ?? "");
                }}
              >
                <SPageInfoHeader>
                  <SPageInfoFaviconImage src={pageInfo.fav_icon_url} />
                  <SPageInfoTitle>{pageInfo.page_title}</SPageInfoTitle>
                </SPageInfoHeader>
                <SPageInfoLink>{pageInfo.page_url}</SPageInfoLink>
              </SPageInfo>
              <Tooltip title="このページに絞り込む">
                <SPageInfo
                  isFilter
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickFilter(pageInfo.id);
                  }}
                >
                  <SFilterIcon fill="rgba(0, 0, 0, 0.4)" />
                </SPageInfo>
              </Tooltip>
            </SPageInfoWrap>
          )}
          <SCardFooter>
            <SCardActions>
              <Tooltip title="編集" enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModal(true);
                    }}
                  >
                    <EditIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                </SIconButtonWrap>
              </Tooltip>
              <Tooltip title={isSuccessCopy ? "コピーしました" : "コピー"} enterDelay={300}>
                <SIconButtonWrap>
                  {isSuccessCopy ? (
                    <SCopySuccessIcon fill="#22c55e" />
                  ) : (
                    <SIconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        copyClipboard(`${title}\n${description}`);
                      }}
                    >
                      <CopyIcon fill="rgba(0, 0, 0, 0.4)" />
                    </SIconButton>
                  )}
                </SIconButtonWrap>
              </Tooltip>
              <Tooltip title="削除" enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      id && onDelete(note);
                    }}
                  >
                    <TrashIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                </SIconButtonWrap>
              </Tooltip>
              <Tooltip title="ページへ移動" enterDelay={300}>
                <SIconButtonWrap>
                  <SIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickLink(pageInfo?.page_url ?? "");
                    }}
                  >
                    <LaunchIcon fill="rgba(0, 0, 0, 0.4)" />
                  </SIconButton>
                </SIconButtonWrap>
              </Tooltip>
            </SCardActions>
            <SCardDate>
              {created_at && (
                <SCardDateText> 作成: {formatDate(new Date(created_at))}</SCardDateText>
              )}
              {updated_at && (
                <SCardDateText> 編集: {formatDate(new Date(updated_at))}</SCardDateText>
              )}
            </SCardDate>
          </SCardFooter>
        </SCard>
        <NoteEditModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          note={note}
          onUpdateNote={onUpdate}
        />
      </>
    );
  }
);

const SCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 0.25em;
  padding: 0.75em 1em;
  height: 100%;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  }
`;

const SCardHeader = styled.div`
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.1); */
`;

const noteTitleCSS = css`
  font-size: 1em;
  line-height: 1.25;
  color: #333;
  border-width: 0.0625em;
  border-color: transparent;
  border-radius: 0.2em;
  word-break: break-all;
  white-space: pre-line;
`;
const noteDescriptionCSS = css`
  margin-bottom: 0.75em;
  padding: 0.25em 0;
  line-height: 1.25;
  color: #333;
  border-width: 1px;
  border-color: transparent;
  border-radius: 0.2em;
  word-break: break-all;
  white-space: pre-line;
`;

const SCardTitle = styled.h3`
  ${noteTitleCSS}
`;

const SCardDescription = styled.div`
  flex: 1;
  ${noteDescriptionCSS}
`;

const SCardDescriptionText = styled.span`
  font-size: 0.875em;
`;

const SCardDate = styled.div`
  font-size: 0.75em;
  line-height: 1.5;
  text-align: right;
  color: #777;
`;

const SCardDateText = styled.span`
  margin-right: 1em;
`;

const SCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const SCardActions = styled.div`
  display: flex;
  align-items: center;
`;

const SIconButtonWrap = styled.div`
  margin-right: 0.5em;
`;

const SCopySuccessIcon = styled(CopySuccessIcon)`
  width: 1.25em;
  height: 1.25em;
`;

const SIconButton = styled(IconButton)`
  width: 1.25em;
  height: 1.25em;
`;

const SPageInfoWrap = styled.div`
  display: inline-flex;
  margin-bottom: 0.5em;
`;

const SPageInfo = styled.div<{ isFilter?: boolean }>`
  display: inline-block;
  justify-self: stretch;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25em;
  padding: 0.5em 0.75em;
  background-color: #fff;
  cursor: pointer;

  ${({ isFilter }) =>
    isFilter &&
    css`
      display: inline-flex;
      align-items: center;
    `}

  &:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right-width: 0;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
const SPageInfoHeader = styled.div`
  display: flex;
  align-items: center;
`;
const SPageInfoFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;
const SPageInfoTitle = styled.p`
  font-size: 0.75em;
  line-height: 1.25;
`;
const SPageInfoLink = styled.p`
  font-size: 0.625em;
  word-break: break-all;
  text-decoration: underline;
  color: #00379e;
  margin-top: 0.5em;
  margin-left: 2.4em;
`;

const SFilterIcon = styled(FilterIcon)`
  width: 1em;
  height: 1em;
`;

export default OptionListItem;
