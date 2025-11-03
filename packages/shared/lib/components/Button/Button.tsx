import { SButton } from './Button.style.js';
import { memo } from 'react';
import type React from 'react';

const Button: React.FC<Props> = memo(({ children, ...props }) => <SButton {...props}>{children}</SButton>);

Button.displayName = 'Button';

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
};

export default Button;
