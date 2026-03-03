export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400/90 ring-1 ring-inset ring-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400/90 ring-1 ring-inset ring-blue-500/20',
  processed: 'bg-emerald-500/10 text-emerald-400/90 ring-1 ring-inset ring-emerald-500/20',
  failed: 'bg-rose-500/10 text-rose-400/90 ring-1 ring-inset ring-rose-500/20',
};

export const UPSELL_BADGE_STYLES: Record<string, string> = {
  yes: 'bg-rose-500/10 text-rose-400/90 ring-1 ring-inset ring-rose-500/20',
  maybe: 'bg-amber-500/10 text-amber-400/90 ring-1 ring-inset ring-amber-500/20',
  no: 'bg-zinc-800/50 text-zinc-400 ring-1 ring-inset ring-zinc-700/50',
};
