import styled, { createGlobalStyle, css } from "styled-components";
import IconButton from "../../components/Button/IconButton";
import { SubdirectoryArrowLeftIcon } from "../../components/Icon";
import { resetCSS } from "../../resetCSS";

export const GlobalStyle = createGlobalStyle`
  ${resetCSS}
`;

export const SHeader = styled.header`
  padding: 1em;
  display: flex;
  align-items: center;
`;

export const SHeaderLeft = styled.div`
  flex: 1;
`;

export const SHeaderRight = styled.div``;

export const SContent = styled.div``;

export const SMessageText = styled.p`
  padding: 1em;
  color: #aaa;
`;

export const SActionMessageText = styled.p`
  padding: 1em;
`;

export const SActionMessageSpan = styled.span`
  font-size: 1.25em;
`;

export const SSubdirectoryArrowLeftIcon = styled(SubdirectoryArrowLeftIcon)`
  width: 2em;
  height: 2em;
  transform: rotate(90deg);
  margin-left: 0.75em;
  margin-right: 0.5em;
`;

export const SListItem = styled.li`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

export const SListItemLeft = styled.div<{ disabled?: boolean }>`
  padding: 1em 0.25rem 1em 1em;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    `}

    & > span {
      flex: 1;
    }

    & > svg {
      width: 1rem;
    }
`;
export const SListItemRight = styled.div`
  padding: 1em;
`;

export const SHeaderIconButton = styled(IconButton)`
  margin-left: 1em;
  width: 2em;
  height: 2em;
  padding: 0.25em;
`;

export const SPinIconButton = styled(IconButton)<{ isPin: boolean }>`
  margin: 0 0.5em;

  ${({ isPin }) =>
    isPin &&
    css`
      opacity: 0.2;

      &:hover {
        opacity: 1;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 1;
    `}
`;

export const SIconButton = styled(IconButton)`
  margin: 0 0.5em;
`;
