import React from "react";
import { memo } from "react";
import { SIconButton } from "./Button.style";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

const IconButton: React.FC<Props> = memo(({ children, ...props }) => {
  return <SIconButton {...props}>{children}</SIconButton>;
});

export default IconButton;
