import React, { VFC } from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

type Props = {
  current: "memos" | "setting";
};

export const OptionHeader: VFC<Props> = ({ current }) => {
  return (
    <SHeader>
      <SHeaderLeft>
        <STopLink to="/memos.html">
          <SLogo src="/images/icon_38.png" alt="" />
          <STitle>どこでもメモ</STitle>
        </STopLink>
      </SHeaderLeft>
      <SHeaderContent>
        <SHeaderContentLink $isActive={current === "memos"} to="/memos.html">
          メモ一覧
        </SHeaderContentLink>
        <SHeaderContentLink $isActive={current === "setting"} to="/setting.html">
          設定
        </SHeaderContentLink>
      </SHeaderContent>
    </SHeader>
  );
};

export default OptionHeader;

export const SHeader = styled.header`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.75em;
  padding: 0 1.75em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1;
`;

export const SHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const SLogo = styled.img`
  width: 1.5em;
  margin-top: -0.25em;
  margin-right: 0.25em;
`;

export const STitle = styled.h1``;

export const STopLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.25em;
  position: relative;

  &:hover {
    opacity: 0.8;
  }
`;

export const SHeaderContent = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
  padding: 0 1em;
`;

export const SHeaderContentLink = styled(Link)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
  margin: 0 0.25em;
  padding: 0 1em;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #4c4722;
      }
    `}
`;
