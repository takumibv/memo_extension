import { SIconButton } from './Button.style.js';
import { memo } from 'react';
import type React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

const IconButton: React.FC<Props> = memo(({ children, ...props }) => <SIconButton {...props}>{children}</SIconButton>);

IconButton.displayName = 'IconButton';

export default IconButton;
