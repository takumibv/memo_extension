import React from "react";
import { memo } from "react";
import { SButton } from "./Button.style";

export type Props = React.HTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
  disabled?: boolean;
};

const Button: React.VFC<Props> = memo(({ children, ...props }) => {
  return <SButton {...props}>{children}</SButton>;
});

export default Button;
