import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export const inputCls =
  'w-full rounded-lg border border-hairline bg-surface-base px-3 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-hairline flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
          <Icon className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-content-primary">{title}</h2>
          <p className="text-xs text-content-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  const isSuccess = type === 'success';
  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg text-xs mt-3 ${
        isSuccess
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
      }`}
    >
      {isSuccess ? (
        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}
