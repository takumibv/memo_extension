import { SFabIconButton } from './Button.style.js';
import { memo } from 'react';
import type React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

const FabIconButton: React.FC<Props> = memo(({ children, ...props }) => (
  <SFabIconButton {...props}>{children}</SFabIconButton>
));

FabIconButton.displayName = 'FabIconButton';

export default FabIconButton;
