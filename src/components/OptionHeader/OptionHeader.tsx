import React, { FC } from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { msg } from "../../utils";
import { User } from "../../types/User";
import { useAuth } from "../../hooks/useFirebaseAuth";
import { Popover } from "@mui/material";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import IconButton from "../Button/IconButton";

type Props = {
  current: "memos" | "setting";
};

export const OptionHeader: FC<Props> = ({ current }) => {
  const { isLoading, user, login, logout } = useAuth();

  return (
    <SHeader>
      <SHeaderLeft>
        <STopLink to="/memos.html">
          <SLogo src="/images/icon_38.png" alt="" />
          <STitle>{msg("appName")}</STitle>
        </STopLink>
      </SHeaderLeft>
      <SHeaderContent>
        <SHeaderContentLink $isActive={current === "memos"} to="/memos.html">
          {msg("note_header_msg")}
        </SHeaderContentLink>
        <SHeaderContentLink $isActive={current === "setting"} to="/setting.html">
          {msg("settings_header_msg")}
        </SHeaderContentLink>
      </SHeaderContent>
      {!isLoading && (
        <SHeaderRight>
          <AccountArea user={user} logout={logout} login={login} />
        </SHeaderRight>
      )}
    </SHeader>
  );
};

const AccountArea = ({
  user,
  logout,
  login,
}: {
  user?: User | null;
  logout?: () => void;
  login?: () => void;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClickPopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAccountPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };
  const isOpenAccountPopover = Boolean(anchorEl);
  const popoverId = isOpenAccountPopover ? "color-picker-popover" : undefined;

  // TODO
  const isLoading = false;

  return user ? (
    <>
      <SAccountButton onClick={onClickPopoverOpen} $isActive={isOpenAccountPopover}>
        <SAccountButtonName>{user.name}</SAccountButtonName>
        <SAccountButtonNameImage>
          <img src={user.photoURL} width={36} height={36} />
        </SAccountButtonNameImage>
      </SAccountButton>
      <Popover
        id={popoverId}
        open={isOpenAccountPopover}
        anchorEl={anchorEl}
        onClose={handleCloseAccountPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <SAccountPopover style={{ width: "240px" }} onClick={(e) => e.stopPropagation()}>
          <SAccountPopoverHeader>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <SAccountPopoverLastUpdated $isLoading={isLoading}>
              <span>
              最終更新日: 2023/5/24 18:20
              </span>
              <SIconButton disabled={isLoading}>
                <ArrowPathIcon fill="rgba(0, 0, 0, 0.4)" />
              </SIconButton>
            </SAccountPopoverLastUpdated>
          </SAccountPopoverHeader>
          <div className="">
            <SAccountPopoverAction
              onClick={(e) => {
                // TODO syncNotes
                logout?.();
                handleCloseAccountPopover(e);
              }}
            >
              ログアウト
            </SAccountPopoverAction>
          </div>
        </SAccountPopover>
      </Popover>
    </>
  ) : (
    <SAccountButton onClick={login}>ログイン</SAccountButton>
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
export const SHeaderRight = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  align-self: stretch;
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
  flex: 1;
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

const SAccountButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.25em 0.5rem;
  position: relative;
  height: 100%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: rgba(0, 0, 0, 0.05);
    `}
`;

const SAccountButtonName = styled.span`
  margin-right: 0.5rem;
  font-size: 0.875rem;
  color: #555;
`;

const SAccountButtonNameImage = styled.span`
  display: inline-block;
  border-radius: 999px;
  width: 2.25rem;
  height: 2.25rem;
  overflow: hidden;
`;

const SAccountPopover = styled.div`
  background-color: #fff;
`;
const SAccountPopoverHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;

  h2 {
    font-size: 0.875rem;
    color: #555;
    word-break: break-all;
  }

  p {
    font-size: 0.75rem;
    margin-top: 0.5rem;
    color: #888;
    word-break: break-all;
  }
`;

const SAccountPopoverAction = styled.button`
  font-size: 0.875rem;
  color: #555;
  width: 100%;
  padding: 0.5rem 1rem;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const SIconButton = styled(IconButton)``;

const SAccountPopoverLastUpdated = styled.p<{ $isLoading?: boolean }>`
  margin-top: 1rem;

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      /* くるくるアニメーションさせる */
      ${SIconButton} {
        display: inline-block;
        animation: rotateAnimation 1s linear infinite;
      }

      @keyframes rotateAnimation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

    `}
`;