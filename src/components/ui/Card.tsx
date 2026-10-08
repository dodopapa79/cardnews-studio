import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Card({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={clsx(
        'bg-surface-card rounded-xl border border-surface-border shadow-card',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div className="min-w-0">
        <h3 className="font-bold text-ink-primary text-base">{title}</h3>
        {subtitle && (
          <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}