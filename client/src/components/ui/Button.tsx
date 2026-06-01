import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type ButtonProps<T extends ElementType = 'button'> = {
  as?: T;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  return (
    <Component className={`button ${variant} ${size} ${className}`} {...props}>
      {children}
    </Component>
  );
}
