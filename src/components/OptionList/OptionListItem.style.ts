import styled, { css } from "styled-components";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { CopySuccessIcon } from "../Icon";
import IconButton from "../Button/IconButton";

export const SCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: #fff;
  border-radius: 0.25em;
  padding: 0.75em 1em;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;

  &:hover,
  &:focus {
    outline: 0;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  }
`;

export const SCardHeader = styled.div`
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.1); */
`;

export const noteTitleCSS = css`
  font-size: 1em;
  line-height: 1.25;
  color: #333;
  border-width: 0.0625em;
  border-color: transparent;
  border-radius: 0.2em;
  word-break: break-all;
  white-space: pre-line;
`;
export const noteDescriptionCSS = css`
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

export const SCardTitle = styled.h3`
  ${noteTitleCSS}
`;

export const SCardDescription = styled.div`
  flex: 1;
  ${noteDescriptionCSS}
`;

export const SCardDescriptionText = styled.span`
  font-size: 0.875em;
`;

export const SCardDate = styled.div`
  font-size: 0.75em;
  line-height: 1.5;
  text-align: right;
  color: #777;
`;

export const SCardDateText = styled.span`
  margin-right: 1em;
`;

export const SCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

export const SCardActions = styled.div`
  display: flex;
  align-items: center;
`;

export const SIconButtonWrap = styled.div`
  margin-right: 1em;
`;

export const SCopySuccessIcon = styled(CopySuccessIcon)`
  width: 1.25em;
  height: 1.25em;
`;

export const SIconButton = styled(IconButton)`
  width: 1.25em;
  height: 1.25em;
`;

export const SPageInfoWrap = styled.div`
  display: inline-flex;
  margin-bottom: 0.75em;
`;

export const SPageInfo = styled.div<{ $isFilter?: boolean }>`
  display: inline-block;
  justify-self: stretch;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25em;
  padding: 0.5em 0.75em;
  background-color: #fff;
  cursor: pointer;

  ${({ $isFilter }) =>
    $isFilter &&
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
export const SPageInfoHeader = styled.div`
  display: flex;
  align-items: center;
`;
export const SPageInfoFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;
export const SPageInfoTitle = styled.p`
  font-size: 0.75em;
  line-height: 1.25;
  word-break: break-all;
`;
export const SPageInfoLink = styled.p`
  font-size: 0.625em;
  word-break: break-all;
  text-decoration: underline;
  color: #00379e;
  margin-top: 0.5em;
  margin-left: 2.4em;
`;

export const SLaunchIcon = styled(ArrowTopRightOnSquareIcon)`
  width: 1em;
  height: 1em;
`;
