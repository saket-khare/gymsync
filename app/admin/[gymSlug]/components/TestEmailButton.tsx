'use client';

import { useState } from 'react';
import {
  PaperPlaneRightIcon as Send,
  CheckCircleIcon as CheckCircle,
  WarningIcon as AlertTriangle,
} from '@phosphor-icons/react';

export function TestEmailButton({ trainerEmail }: { trainerEmail: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: trainerEmail || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Request failed');
        return;
      }
      setStatus('ok');
      setMessage(`Sent to ${data.to}`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={status === 'sending' || !trainerEmail}
        title={trainerEmail ? 'Send a test email to the trainer address' : 'Set trainer email in gym settings'}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1e1e24] hover:bg-[#27272f] border border-zinc-800/80 rounded-md text-zinc-300 transition-colors disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        {status === 'sending' ? 'Sending...' : 'Test email'}
      </button>
      {status === 'ok' && (
        <span className="text-xs text-emerald-400/90 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          {message}
        </span>
      )}
      {status === 'error' && (
        <span className="text-xs text-rose-400/90 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {message}
        </span>
      )}
    </div>
  );
}
