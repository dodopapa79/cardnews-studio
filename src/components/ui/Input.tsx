'use client';
import { clsx } from 'clsx';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export function Input({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      {label && (
        <div className="text-xs font-medium text-ink-secondary mb-1.5">{label}</div>
      )}
      <input
        {...rest}
        className={clsx(
          'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'placeholder:text-ink-muted transition-shadow',
          className
        )}
      />
      {hint && <div className="text-xs text-ink-muted mt-1.5">{hint}</div>}
    </label>
  );
}

export function Textarea({
  label,
  hint,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      {label && (
        <div className="text-xs font-medium text-ink-secondary mb-1.5">{label}</div>
      )}
      <textarea
        {...rest}
        className={clsx(
          'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'placeholder:text-ink-muted transition-shadow resize-none',
          className
        )}
      />
      {hint && <div className="text-xs text-ink-muted mt-1.5">{hint}</div>}
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && (
        <div className="text-xs font-medium text-ink-secondary mb-1.5">{label}</div>
      )}
      <select
        {...rest}
        className={clsx(
          'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          className
        )}
      >
        {children}
      </select>
    </label>
  );
}