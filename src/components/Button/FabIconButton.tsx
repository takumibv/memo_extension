import React from "react";
import { memo } from "react";
import { SFabIconButton } from "./Button.style";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

const IconButton: React.VFC<Props> = memo(({ children, ...props }) => {
  return <SFabIconButton {...props}>{children}</SFabIconButton>;
});

export default IconButton;
