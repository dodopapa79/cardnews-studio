import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'primary' && 'bg-primary-100 text-primary-700',
        variant === 'success' && 'bg-green-100 text-green-700',
        variant === 'warning' && 'bg-orange-100 text-orange-700',
        variant === 'danger' && 'bg-red-100 text-red-700',
        className
      )}
    >
      {children}
    </span>
  );
}