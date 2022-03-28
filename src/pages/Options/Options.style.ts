import styled, { createGlobalStyle, css } from "styled-components";
import { Reorder } from "framer-motion";
import { SearchIcon, SortIcon } from "../../components/Icon";
import { resetCSS } from "../../resetCSS";
import IconButton from "../../components/Button/IconButton";

export const GlobalStyle = createGlobalStyle`
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

export const SContainer = styled.div`
  /* height: 100vh; */
  position: relative;
`;

export const SMain = styled.div`
  overflow: hidden;
  /* padding: 0 1.125em; */
`;

export const SMainLeft = styled.div`
  position: fixed;
  left: 0;
  top: 2.75em;
  bottom: 0;
  overflow-y: auto;
  width: 18em;
  padding-left: 1em;
`;

export const SSideNav = styled.ul`
  list-style: none;
  padding: 1.5em 0.75em;
`;

export const SSideNavItem = styled.a<{ $isActive?: boolean }>`
  display: block;
  border-radius: 0.5em;
  padding: 0.75em;
  margin-bottom: 0.5em;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      font-weight: bold;
      cursor: default;
      background-color: #fef3c7;

      &:hover {
        background-color: #fef3c7;
      }
    `}
`;

export const SFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;

export const SSideNavItemHeader = styled.div`
  word-break: break-all;
  display: flex;
  align-items: center;
`;

export const SSideNavItemTitle = styled.p`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 0.875em;
  line-height: 1.25;
  flex: 1;
`;

export const SSideNavItemLink = styled.p`
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

export const SMainRight = styled.main`
  overflow-y: auto;
  padding: 4em 2em 1.5em 19em;
`;

export const SMainRightHeader = styled.div`
  display: flex;
  margin-bottom: 0.25em;
`;

export const SInputWrap = styled.div`
  position: relative;
  flex: 1;
`;

export const SInputIcon = styled(SearchIcon)`
  position: absolute;
  left: 0.75em;
  top: 50%;
  width: 1.25em;
  transform: translateY(-50%);
  pointer-events: none;
`;

export const SInput = styled.input`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5em 0.75em 0.5em 2.25em;
  border-radius: 999em;
  width: 100%;

  &:hover,
  &:focus {
    border-color: #fcd34d;
  }
`;

export const SSelectWrap = styled.div`
  position: relative;
  margin-left: 0.75em;
  width: 12em;
`;

export const SSelectIcon = styled(SortIcon)`
  position: absolute;
  left: 0.5em;
  top: 50%;
  width: 1.25em;
  transform: translateY(-50%);
  pointer-events: none;
`;

export const SSelect = styled.select`
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

export const SCurrentPageArea = styled.div`
  margin-top: 0.75em;
  padding: 0.75em;
  border-radius: 0.25em;
  background-color: rgba(0, 0, 0, 0.08);
`;

export const SCurrentPageAreaHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const SCurrentPageFaviconImage = styled.img`
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
`;

export const SCurrentPageTitle = styled.p`
  flex: 1;
  font-size: 1em;
  margin-bottom: 0.25em;
`;

export const SCurrentPageCloseButton = styled(IconButton)`
  margin-left: 0.5em;
`;

export const SCurrentPageLink = styled.a`
  display: block;
  margin-left: 1.5em;
  word-break: break-all;
  text-decoration: underline;
  color: #00379e;
`;

export const SNoNoteText = styled.p`
  padding: 1em;
  color: #aaa;
`;

export const SCardList = styled(Reorder.Group)`
  display: flex;
  flex-wrap: wrap;
  padding: 0.25em 0;
  margin: 0 -0.5em;
`;

export const SCardListItem = styled(Reorder.Item)`
  padding: 0.5em;
  width: 100%;
  /* width: 50%; */
  /* transition: all 0.2s ease-in-out; */
`;
