import React, { memo, useEffect, useState } from "react";
import { msg } from "../../utils";
import styled, { css } from "styled-components";

type Props = {};

const Usage: React.FC<Props> = memo(() => {
  // インストール直後は目立たせる
  const isInit = window.location.hash === "#init";

  return (
    <SUsageContainer $isInit={isInit}>
      <SUsageContent>
        {isInit && <SUsageWelcome>{msg("welcome_msg")}</SUsageWelcome>}
        <SUsageItem>
          <h3>{msg("usage01")}</h3>
          <SUsageImageArea>
            <img width={400} src="/images/usage/usage01.png" alt="" />
          </SUsageImageArea>
        </SUsageItem>
        <SUsageItem>
          <h3>{msg("usage02")}</h3>
          <SUsageImageArea>
            <img width={400} src="/images/usage/usage02.png" alt="" />
          </SUsageImageArea>
        </SUsageItem>
        <SUsageItem>
          <h3>{msg("usage02_2")}</h3>
          <SUsageImageArea>
            <img width={200} src="/images/usage/usage02_2.png" alt="" />
          </SUsageImageArea>
        </SUsageItem>
        <SUsageItem>
          <h3>
            {msg("usage03")}
            <br />
            {msg("usage04")}
          </h3>
          <SUsageImageArea>
            <img src="/images/usage/usage03.png" alt="" />
          </SUsageImageArea>
        </SUsageItem>
        <SUsageItem>
          <h3>{msg("usage05")}</h3>
          <SUsageImageArea>
            <img width={400} src="/images/usage/usage05.png" alt="" />
          </SUsageImageArea>
        </SUsageItem>
        <SUsageItem>
          <h3>
            <a href="./memos.html">{msg("usage06")}</a>
            {msg("usage06_2")}
          </h3>
        </SUsageItem>
        <SUsageItem>
          <h3>{msg("usage07")}</h3>
          <SUsageImageArea>
            <img width={300} src="/images/usage/usage06.png" alt="" />
          </SUsageImageArea>
          <SUsageFunctionList>
            <li>
              <b>{msg("pin_msg")}</b>: {msg("pin_explain_msg")}
            </li>
            <li>
              <b>{msg("edit_msg")}</b>: {msg("edit_explain_msg")}
            </li>
            <li>
              <b>{msg("copy_msg")}</b>: {msg("copy_explain_msg")}
            </li>
            <li>
              <b>{msg("color_msg")}</b>: {msg("color_explain_msg")}
            </li>
            <li>
              <b>{msg("delete_msg")}</b>: {msg("delete_explain_msg")}
            </li>
            <li>
              <b>{msg("open_msg")}</b>: {msg("open_explain_msg")}
            </li>
          </SUsageFunctionList>
        </SUsageItem>
      </SUsageContent>
    </SUsageContainer>
  );
});

export default Usage;

const SUsageContainer = styled.div<{ $isInit?: boolean }>`
  padding: 2rem 1rem;

  ${({ $isInit }) =>
    $isInit &&
    css`
      border-radius: 0.5rem;
      background-color: #FFF7CC;
      position: relative;

      &:before {
        content: "";

        animation: 2s ease-out 0s 3 fluffyAnimation forwards;

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0.5rem;
        transform-origin: center;
      }

      /* ふわっと広がるアニメーション */
      @keyframes fluffyAnimation {
        0% {
          box-shadow: 0 0 0 0 #ffe600;
        }
        50% {
          box-shadow: 0 0 0 1rem rgba(255, 230, 0, 0);
        }
        100% {
          box-s
          box-shadow: 0 0 0 2rem rgba(255, 230, 0, 0);
        }
      }
    `}

  ${({ $isInit }) =>
    !$isInit &&
    css`
      /* border: 1px solid #ccc; */
      background-color: #fff;
    `}
`;

const SUsageContent = styled.div`
  position: relative;
`;

const SUsageItem = styled.div`
  margin-bottom: 2.5rem;

  & > h3 {
    text-align: center;
    line-height: 1.5;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  a {
    color: #002761;
    text-decoration: underline;
  }
`;

const SUsageWelcome = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const SUsageImageArea = styled.div`
  text-align: center;
  margin-bottom: 1rem;

  & > img {
    max-width: 30rem;
    margin: auto;
  }
`;

const SUsageFunctionList = styled.ol`
  font-size: 0.875rem;
  width: 25rem;
  list-style: decimal;
  margin: auto;

  & > li {
    margin-bottom: 0.5rem;
    line-height: 1.25;
  }
`;
