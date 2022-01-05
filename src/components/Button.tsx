import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";
import { baseCSS } from "../resetCSS";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
  disabled?: boolean;
};

const Button: React.VFC<Props> = memo(({ children, ...props }) => {
  return <SButton {...props}>{children}</SButton>;
});

const SButton = styled.button<Props>`
  ${baseCSS("button")}

  cursor: pointer;
  border-radius: 999em;
  padding: 0.25em 0.75em;
  font-size: 0.875em;

  /* primary */
  color: #fff;
  background-color: #0070f3;
  transition: background-color 300ms cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover,
  &:focus {
    outline: none;
    background-color: #0057b9;
  }

  ${({ secondary }) =>
    secondary &&
    css`
      color: #0070f3;
      background-color: transparent;
      font-size: 0.75em;
      padding: 0.25em 0.5em;

      &:hover,
      &:focus {
        outline: none;
        background-color: #dcecff;
      }
    `}

  &:disabled {
    opacity: 0.5;
    background-color: #aaa;

    &:hover,
    &:focus {
      background-color: #aaa;
    }
  }
`;

export default Button;
