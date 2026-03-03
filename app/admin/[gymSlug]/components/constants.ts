// Light mode: solid light bg + saturated text. Dark mode: translucent bg + lighter text.
export const STATUS_STYLES: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400/90 dark:ring-amber-500/20',
  processing:
    'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400/90 dark:ring-blue-500/20',
  processed:
    'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400/90 dark:ring-emerald-500/20',
  failed:
    'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400/90 dark:ring-rose-500/20',
};
