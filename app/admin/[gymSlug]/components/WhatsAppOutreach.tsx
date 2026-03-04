'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  XIcon as X,
  PaperPlaneTiltIcon as Send,
  SpinnerIcon as Spinner,
  ArrowsClockwiseIcon as Refresh,
  WarningIcon as Warning,
} from '@phosphor-icons/react';
import type { SheetRow, GymConfig } from '@/types';
import { goalLabel } from '@/lib/utils';

// ─── Fallback template (used if AI fails) ────────────────────────────────────

const WAVE = '\u{1F44B}';
const PRAY = '\u{1F64F}';

function buildFallbackMessage(member: SheetRow, gymConfig: GymConfig): string {
  const goal = goalLabel(member.primaryGoal);
  return [
    `Hi ${member.firstName}! ${WAVE}`,
    '',
    `This is ${gymConfig.trainerName} from ${gymConfig.name}.`,
    '',
    `I saw you're working towards ${goal.toLowerCase()} — we'd love to help you get there. Come in for a quick visit this week and we'll put together a plan just for you.`,
    '',
    `When are you free? ${PRAY}`,
  ].join('\n');
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface WhatsAppOutreachProps {
  member: SheetRow;
  gymConfig: GymConfig;
  onClose: () => void;
}

function WhatsAppOutreach({ member, gymConfig, onClose }: WhatsAppOutreachProps) {
  const [message, setMessage] = useState('');
  const [generating, setGenerating] = useState(true);
  const [aiError, setAiError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function generateMessage() {
    setGenerating(true);
    setAiError(false);
    try {
      const res = await fetch('/api/admin/leads/generate-wa-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          trainerName: gymConfig.trainerName,
          gymName: gymConfig.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessage(data.message);
      } else {
        setMessage(buildFallbackMessage(member, gymConfig));
        setAiError(true);
      }
    } catch {
      setMessage(buildFallbackMessage(member, gymConfig));
      setAiError(true);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => { generateMessage(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const phone = member.phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#131316] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800/60 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
                Message {member.firstName} {member.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-500">+91 {member.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-sm text-gray-500 dark:text-zinc-400">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <Spinner className="w-4 h-4 text-[#25D366] animate-spin" />
              </div>
              <p>Crafting a personal message…</p>
            </div>
          ) : (
            <>
              {/* Label row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                    Message
                  </p>
                  {!aiError && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                      AI personalized
                    </span>
                  )}
                  {aiError && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                      <Warning className="w-3 h-3" />
                      Template fallback
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateMessage}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <Refresh className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>

              {/* Editable textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-900/50 text-sm text-gray-800 dark:text-zinc-200 p-3.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]/60 transition-all"
                style={{ overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />

              <p className="text-[11px] text-gray-400 dark:text-zinc-600">
                You can edit the message above before sending.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800/60 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            aria-disabled={generating}
            className={`flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              generating
                ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 pointer-events-none'
                : 'bg-[#25D366] hover:bg-[#1ebe5d] text-white'
            }`}
          >
            <Send className="w-4 h-4" weight="fill" />
            Open in WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Trigger button (used in table rows) ─────────────────────────────────────

export function WhatsAppButton({
  member,
  gymConfig,
}: {
  member: SheetRow;
  gymConfig: GymConfig;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={`WhatsApp ${member.firstName}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1a9e4e] dark:text-[#25D366] border border-[#25D366]/20 hover:border-[#25D366]/40 transition-all"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
        WhatsApp
      </button>

      {open && (
        <WhatsAppOutreach
          member={member}
          gymConfig={gymConfig}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
