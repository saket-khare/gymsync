'use client';

import { useState, useEffect } from 'react';
import { XIcon as Close, CalendarBlankIcon as Calendar } from '@phosphor-icons/react';
import type { SheetRow } from '@/types';

export type PlanType = 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';

interface SubscriptionType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

const PLAN_OPTIONS: { value: PlanType; label: string; months: number; suggestedAmount: number }[] = [
  { value: 'monthly', label: 'Monthly', months: 1, suggestedAmount: 1500 },
  { value: 'quarterly', label: 'Quarterly (3 months)', months: 3, suggestedAmount: 4000 },
  { value: 'half_yearly', label: 'Half Yearly (6 months)', months: 6, suggestedAmount: 7500 },
  { value: 'annual', label: 'Annual (12 months)', months: 12, suggestedAmount: 14000 },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  // Go back one day so "1 month from Jan 1" = Jan 31
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface SubscriptionModalProps {
  members: SheetRow[];
  gymSlug: string;
  /** When renewing, pre-selects the member */
  preselectedMemberId?: string;
  /** DB uuid of the member (not rowId) */
  preselectedMemberDbId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionModal({
  members,
  gymSlug,
  preselectedMemberId,
  preselectedMemberDbId,
  onClose,
  onSuccess,
}: SubscriptionModalProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [memberId, setMemberId] = useState(preselectedMemberDbId ?? '');
  const [typeId, setTypeId] = useState('');
  const [planType, setPlanType] = useState<PlanType>('monthly');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addMonths(today, 1));
  const [amountPaid, setAmountPaid] = useState(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subTypes, setSubTypes] = useState<SubscriptionType[]>([]);

  useEffect(() => {
    fetch(`/api/admin/subscription-types?gymSlug=${gymSlug}`)
      .then((r) => r.json())
      .then((d) => setSubTypes((d.types ?? []).filter((t: SubscriptionType) => t.isActive)))
      .catch(() => {});
  }, [gymSlug]);

  // Auto-compute end date when plan or start changes
  useEffect(() => {
    const plan = PLAN_OPTIONS.find((p) => p.value === planType);
    if (plan) {
      setEndDate(addMonths(startDate, plan.months));
      setAmountPaid(plan.suggestedAmount);
    }
  }, [planType, startDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) {
      setError('Please select a member');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          typeId: typeId || undefined,
          planType,
          startDate,
          endDate,
          amountPaid,
          paymentMethod,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E11] text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
              {preselectedMemberDbId ? 'Renew Subscription' : 'Add Subscription'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              {preselectedMemberId
                ? `Renewing for ${members.find((m) => m.rowId === preselectedMemberId)?.firstName ?? 'member'}`
                : 'Record a new subscription or payment'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Member select */}
          <div>
            <label className={labelCls}>Member *</label>
            <select
              className={inputCls}
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              disabled={!!preselectedMemberDbId}
            >
              <option value="">Select a member…</option>
              {members.filter((m) => !!m.id).map((m) => (
                <option key={m.rowId} value={m.id!}>
                  {m.firstName} {m.lastName} — {m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription type */}
          {subTypes.length > 0 && (
            <div>
              <label className={labelCls}>Subscription Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTypeId('')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    typeId === ''
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  General
                </button>
                {subTypes.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTypeId(st.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      typeId === st.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plan type */}
          <div>
            <label className={labelCls}>Duration *</label>
            <div className="grid grid-cols-2 gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlanType(p.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                    planType === p.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> End Date
                </span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Amount + Payment method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Amount Paid (₹) *</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Payment Method *</label>
              <select
                className={inputCls}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                required
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="e.g. Paid in two installments, family plan, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? 'Saving…' : 'Save Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
