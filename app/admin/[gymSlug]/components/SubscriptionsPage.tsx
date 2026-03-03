'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CreditCardIcon as CreditCard,
  PlusIcon as Plus,
  ArrowsClockwiseIcon as Refresh,
  WarningCircleIcon as Warning,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  CurrencyCircleDollarIcon as Currency,
  CaretUpIcon as CaretUp,
  CaretDownIcon as CaretDown,
  DotsThreeIcon as DotsThree,
  ReceiptIcon as Receipt,
} from '@phosphor-icons/react';
import type { SheetRow, GymConfig } from '@/types';
import { SubscriptionModal } from './SubscriptionModal';

type SubStatus = 'active' | 'expired' | 'cancelled' | 'paused';

interface SubscriptionEntry {
  id: string;
  memberId: string;
  planType: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: SubStatus;
  notes: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rowId: string;
}

interface SubStats {
  activeCount: number;
  expiringSoonCount: number;
  overdueCount: number;
  monthlyRevenue: number;
}

interface SubscriptionsPageProps {
  members: SheetRow[];
  gymConfig: GymConfig;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: '6 Months',
  annual: 'Annual',
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

const STATUS_STYLES: Record<SubStatus, string> = {
  active:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  expired:
    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  cancelled:
    'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700',
  paused:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  return Math.round((end.getTime() - now.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: typeof CreditCard;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tabular-nums">
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

type StatusFilter = 'all' | SubStatus;
type SortKey = 'name' | 'plan' | 'endDate' | 'amount';
type SortDir = 'asc' | 'desc';

export function SubscriptionsPage({ members, gymConfig }: SubscriptionsPageProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionEntry[]>([]);
  const [stats, setStats] = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [renewForMember, setRenewForMember] = useState<{ rowId: string; dbId: string } | null>(
    null
  );
  const [historyMember, setHistoryMember] = useState<SubscriptionEntry | null>(null);
  const [history, setHistory] = useState<SubscriptionEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('endDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions?gymSlug=${gymConfig.slug}`);
      if (!res.ok) throw new Error('Failed to load subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymConfig.slug]);

  async function fetchHistory(memberId: string) {
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `/api/admin/subscriptions?gymSlug=${gymConfig.slug}&memberId=${memberId}`
      );
      const data = await res.json();
      setHistory(data.history ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: SubStatus) {
    setUpdatingId(id);
    try {
      await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      if (stats) {
        // Rough recompute without refetch
        fetchData();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    let list = subscriptions;
    if (statusFilter !== 'all') list = list.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
      else if (sortKey === 'plan') cmp = a.planType.localeCompare(b.planType);
      else if (sortKey === 'endDate') cmp = a.endDate.localeCompare(b.endDate);
      else if (sortKey === 'amount') cmp = a.amountPaid - b.amountPaid;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [subscriptions, statusFilter, search, sortKey, sortDir]);

  const expiringSoon = useMemo(
    () =>
      subscriptions.filter((s) => {
        const days = daysUntil(s.endDate);
        return s.status === 'active' && days >= 0 && days <= 7;
      }),
    [subscriptions]
  );

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <CaretDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <CaretUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <CaretDown className="w-3 h-3 text-indigo-500" />
    );
  }

  const thCls =
    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-zinc-200';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Subscriptions</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Track member plans, payments, and renewals
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRenewForMember(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Active"
            value={stats.activeCount}
            icon={CheckCircle}
            color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiringSoonCount}
            icon={Clock}
            color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
            sub="within 7 days"
          />
          <StatCard
            label="Overdue"
            value={stats.overdueCount}
            icon={Warning}
            color="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
          />
          <StatCard
            label="Revenue This Month"
            value={`₹${stats.monthlyRevenue.toLocaleString('en-IN')}`}
            icon={Currency}
            color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          />
        </div>
      )}

      {/* Expiring Soon banner */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {expiringSoon.length} subscription{expiringSoon.length > 1 ? 's' : ''} expiring within
              7 days
            </p>
          </div>
          <div className="space-y-2">
            {expiringSoon.map((s) => {
              const days = daysUntil(s.endDate);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-gray-500 dark:text-zinc-400 ml-2 text-xs">
                      {s.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-amber-700 dark:text-amber-400 text-xs font-medium">
                      {days === 0 ? 'Expires today' : `${days}d left`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRenewForMember({ rowId: s.rowId, dbId: s.memberId });
                        setShowModal(true);
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-200 dark:border-zinc-800">
          <input
            type="search"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Refresh className="w-6 h-6 text-gray-400 dark:text-zinc-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Warning className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-zinc-400">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-zinc-800">
              <CreditCard className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">
              {subscriptions.length === 0 ? 'No subscriptions yet' : 'No results'}
            </h3>
            <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1 max-w-xs">
              {subscriptions.length === 0
                ? 'Add a subscription to start tracking member plans and payments.'
                : 'Try a different search or filter.'}
            </p>
            {subscriptions.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setRenewForMember(null);
                  setShowModal(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add first subscription
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                    <th className={thCls} onClick={() => handleSort('name')}>
                      <span className="inline-flex items-center gap-1">
                        Member <SortIcon col="name" />
                      </span>
                    </th>
                    <th className={thCls} onClick={() => handleSort('plan')}>
                      <span className="inline-flex items-center gap-1">
                        Plan <SortIcon col="plan" />
                      </span>
                    </th>
                    <th className={thCls} onClick={() => handleSort('endDate')}>
                      <span className="inline-flex items-center gap-1">
                        Expires <SortIcon col="endDate" />
                      </span>
                    </th>
                    <th className={thCls} onClick={() => handleSort('amount')}>
                      <span className="inline-flex items-center gap-1">
                        Amount <SortIcon col="amount" />
                      </span>
                    </th>
                    <th className={`${thCls} cursor-default`}>Status</th>
                    <th className={`${thCls} cursor-default`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                  {filtered.map((s) => {
                    const days = daysUntil(s.endDate);
                    const isExpiringSoon = s.status === 'active' && days >= 0 && days <= 7;
                    const isOverdue = s.status === 'active' && days < 0;
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-zinc-100">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">{s.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                          <div>{PLAN_LABEL[s.planType] ?? s.planType}</div>
                          <div className="text-xs text-gray-400 dark:text-zinc-500">
                            {PAYMENT_LABEL[s.paymentMethod] ?? s.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={
                              isOverdue
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : isExpiringSoon
                                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                                  : 'text-gray-700 dark:text-zinc-300'
                            }
                          >
                            {formatDate(s.endDate)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-zinc-500">
                            {isOverdue
                              ? `${Math.abs(days)}d overdue`
                              : isExpiringSoon
                                ? days === 0
                                  ? 'today'
                                  : `${days}d left`
                                : `starts ${formatDate(s.startDate)}`}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100 tabular-nums">
                          ₹{s.amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[s.status]}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRenewForMember({ rowId: s.rowId, dbId: s.memberId });
                                setShowModal(true);
                              }}
                              className="text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              Renew
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHistoryMember(s);
                                fetchHistory(s.memberId);
                              }}
                              className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                              title="Payment history"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            {s.status === 'active' && (
                              <button
                                type="button"
                                disabled={updatingId === s.id}
                                onClick={() => handleStatusChange(s.id, 'cancelled')}
                                className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                title="Cancel subscription"
                              >
                                <DotsThree className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filtered.map((s) => {
                const days = daysUntil(s.endDate);
                const isExpiringSoon = s.status === 'active' && days >= 0 && days <= 7;
                const isOverdue = s.status === 'active' && days < 0;
                return (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{s.email}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-zinc-300">
                      <span>{PLAN_LABEL[s.planType] ?? s.planType}</span>
                      <span className="text-gray-400 dark:text-zinc-500">·</span>
                      <span className="font-medium tabular-nums">
                        ₹{s.amountPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div
                      className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-zinc-400'}`}
                    >
                      Expires {formatDate(s.endDate)}
                      {isOverdue && ` · ${Math.abs(days)}d overdue`}
                      {isExpiringSoon && ` · ${days === 0 ? 'today' : `${days}d left`}`}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRenewForMember({ rowId: s.rowId, dbId: s.memberId });
                          setShowModal(true);
                        }}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Renew
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryMember(s);
                          fetchHistory(s.memberId);
                        }}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        History
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Row count */}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-zinc-800/60 text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} of {subscriptions.length} subscription
            {subscriptions.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Payment history drawer */}
      {historyMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setHistoryMember(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
                  Payment History
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {historyMember.firstName} {historyMember.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryMember(null)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Refresh className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-8">
                  No payment history
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-zinc-800 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                          {PLAN_LABEL[h.planType] ?? h.planType}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {formatDate(h.startDate)} → {formatDate(h.endDate)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                          via {PAYMENT_LABEL[h.paymentMethod] ?? h.paymentMethod}
                          {h.notes ? ` · ${h.notes}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tabular-nums">
                          ₹{h.amountPaid.toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[h.status as SubStatus]}`}
                        >
                          {h.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Renew modal */}
      {showModal && (
        <SubscriptionModal
          members={members}
          gymSlug={gymConfig.slug}
          preselectedMemberId={renewForMember?.rowId}
          preselectedMemberDbId={renewForMember?.dbId}
          onClose={() => {
            setShowModal(false);
            setRenewForMember(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setRenewForMember(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
