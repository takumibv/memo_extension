import React from "react";
import { memo } from "react";
import styled from "styled-components";
import { baseCSS } from "../resetCSS";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

const IconButton: React.VFC<Props> = memo(({ children, ...props }) => {
  return <SIconButton {...props}>{children}</SIconButton>;
});

const SIconButton = styled.button`
  ${baseCSS("button")}

  cursor: pointer;
  width: 1.25em;
  height: 1.25em;
  border-radius: 2.5em;
  transition: box-shadow 300ms cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover,
  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 0 0 0.25em rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;

    &:hover,
    &:focus {
      background-color: transparent;
      box-shadow: none;
    }
  }
`;

export default IconButton;
