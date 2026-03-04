'use client';

import { useState, useEffect } from 'react';
import { FileTextIcon as FileText } from '@phosphor-icons/react';

interface TrainerBriefData {
  memberSnapshot: unknown;
  gapAnalysis: string;
  conversationStarters: string[];
  upsellSignal: string;
  upsellReasoning: string;
  redFlags: string[];
  suggestedModifications: string[];
  baselineTestSummary: string | null;
  generatedAt: string;
}

interface TrainerBriefViewProps {
  memberId: string;
  gymSlug: string;
}

export function TrainerBriefView({ memberId, gymSlug }: TrainerBriefViewProps) {
  const [brief, setBrief] = useState<TrainerBriefData | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId || !gymSlug) {
      setBrief(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/trainer-brief?memberId=${encodeURIComponent(memberId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.brief) setBrief(d.brief);
        else setBrief(null);
      })
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [memberId, gymSlug]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-zinc-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        Loading trainer brief…
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="py-4 text-sm text-gray-500 dark:text-zinc-400">
        No trainer brief yet. It’s generated when the member’s meal plan is created.
      </div>
    );
  }

  const snapshot = brief.memberSnapshot as Record<string, unknown> | null;
  const upsellColor =
    brief.upsellSignal === 'HIGH'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      : brief.upsellSignal === 'MEDIUM'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
        : 'bg-gray-500/10 text-gray-600 dark:text-zinc-400 border-gray-500/20';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Trainer Brief
        </h4>
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${upsellColor}`}
        >
          PT signal: {brief.upsellSignal}
        </span>
      </div>

      {snapshot && Object.keys(snapshot).length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-zinc-700/60 bg-gray-50/50 dark:bg-zinc-900/30 p-3 text-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Snapshot
          </p>
          <pre className="text-xs text-gray-700 dark:text-zinc-300 whitespace-pre-wrap font-sans">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
          Gap analysis
        </p>
        <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
          {brief.gapAnalysis}
        </p>
      </div>

      {brief.conversationStarters.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Conversation starters
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-zinc-300 space-y-1">
            {brief.conversationStarters.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
          Upsell reasoning
        </p>
        <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
          {brief.upsellReasoning}
        </p>
      </div>

      {brief.redFlags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-rose-500/90 uppercase tracking-wider mb-2">
            Red flags
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-zinc-300 space-y-1">
            {brief.redFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {brief.suggestedModifications.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Suggested modifications
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-zinc-300 space-y-1">
            {brief.suggestedModifications.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {brief.baselineTestSummary && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Baseline test summary
          </p>
          <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
            {brief.baselineTestSummary}
          </p>
        </div>
      )}

      <p className="text-[11px] text-gray-400 dark:text-zinc-500">
        Generated {brief.generatedAt ? new Date(brief.generatedAt).toLocaleString() : '—'}
      </p>
    </div>
  );
}
