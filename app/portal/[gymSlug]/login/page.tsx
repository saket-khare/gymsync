'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  EnvelopeIcon as Envelope,
  LockKeyIcon as LockKey,
  ArrowRightIcon as ArrowRight,
  ArrowLeftIcon as ArrowLeft,
} from '@phosphor-icons/react';

export default function PortalLoginPage() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const router = useRouter();

  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymSlug, identifier: identifier.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send code');
      setStep('otp');
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymSlug, identifier: identifier.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Invalid code');
      router.push(`/portal/${gymSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E11] text-gray-900 dark:text-zinc-100 px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mx-auto mb-6">
            {step === 'identifier' ? (
              <Envelope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <LockKey className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 text-center mb-1">
            {step === 'identifier' ? 'Member Portal' : 'Enter your code'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-6">
            {step === 'identifier'
              ? 'Enter your email or phone number to receive a login code'
              : `We sent a 6-digit code to ${identifier}`}
          </p>

          {step === 'identifier' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputCls}
                required
              />
              {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Sending…' : 'Send Code'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`${inputCls} text-center text-2xl tracking-widest font-bold`}
                required
              />
              {error && <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Verifying…' : 'Login'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => { setStep('identifier'); setOtp(''); setError(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change identifier
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-zinc-600 mt-6">
          Powered by GymSync
        </p>
      </div>
    </div>
  );
}
