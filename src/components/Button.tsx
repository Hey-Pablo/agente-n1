/**
 * Button Component
 *
 * Botão reutilizável com variantes e tamanhos
 */

import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { Slot } from '@radix-ui/react-slot';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-600',
  link: 'underline-offset-4 hover:underline text-blue-500'
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10'
};

export const Button: FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
};