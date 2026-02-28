'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import type { GymConfig, SheetRow } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime, goalLabel } from '@/lib/utils';

interface AdminDashboardProps {
  gymConfig: GymConfig;
  members: SheetRow[];
  stats: {
    total: number;
    thisMonth: number;
    emailsSent: number;
    highPTLeads: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  processed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const UPSELL_BADGE_COLORS: Record<string, string> = {
  yes: 'bg-red-100 text-red-700',
  maybe: 'bg-yellow-100 text-yellow-700',
  no: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboard({ gymConfig, members, stats }: AdminDashboardProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'failed'>('all');
  const [ptFilter, setPtFilter] = useState<'all' | 'yes' | 'maybe'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';

  function refresh() {
    setIsRefreshing(true);
    window.location.reload();
  }

  const filtered = members.filter((m) => {
    if (filter !== 'all' && m.processingStatus !== filter) return false;
    if (ptFilter !== 'all' && m.interestedInPT !== ptFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {gymConfig.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gymConfig.logoUrl} alt={gymConfig.name} className="h-8 w-auto" />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {gymConfig.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{gymConfig.name}</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-gray-500"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: stats.total, icon: '👥' },
            { label: 'This Month', value: stats.thisMonth, icon: '📅' },
            { label: 'Emails Sent', value: stats.emailsSent, icon: '📧' },
            { label: 'High PT Leads', value: stats.highPTLeads, icon: '🎯' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-500 self-center mr-2">Filter:</span>
          {(['all', 'pending', 'processed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filter === f
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={filter === f ? { backgroundColor: primaryColor } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="text-sm text-gray-400 self-center mx-2">PT:</span>
          {(['all', 'yes', 'maybe'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPtFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                ptFilter === f
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={ptFilter === f ? { backgroundColor: primaryColor } : {}}
            >
              {f === 'all' ? 'All' : f === 'yes' ? 'PT: Yes' : 'PT: Maybe'}
            </button>
          ))}
        </div>

        {/* Members table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏋️</div>
              <p className="text-gray-500 font-medium">No members yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Share your gym&apos;s URL to start collecting member profiles.
              </p>
              <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg inline-block">
                <code className="text-sm text-gray-600">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://gymsync.app'}/
                  {gymConfig.slug}
                </code>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>PT Signal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <>
                    <TableRow
                      key={member.rowId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedRow(expandedRow === member.rowId ? null : member.rowId)
                      }
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {goalLabel(member.primaryGoal)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            UPSELL_BADGE_COLORS[member.interestedInPT] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          PT: {member.interestedInPT}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[member.processingStatus] ?? ''
                          }`}
                        >
                          {member.processingStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {member.submittedAt ? formatDateTime(member.submittedAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 text-sm">
                          {expandedRow === member.rowId ? '▲' : '▼'}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {expandedRow === member.rowId && (
                      <TableRow key={`${member.rowId}-expanded`}>
                        <TableCell colSpan={6} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Age / Gender</p>
                              <p className="font-medium">{member.age} / {member.gender}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Weight / Height</p>
                              <p className="font-medium">{member.weightKg}kg / {member.heightCm}cm</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Experience</p>
                              <p className="font-medium">{member.gymExperience}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Training Days</p>
                              <p className="font-medium">{member.daysPerWeekAvailable}x/week, {member.sessionDurationMinutes}min</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Diet</p>
                              <p className="font-medium">{member.dietType}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Goal Timeline</p>
                              <p className="font-medium">{member.timelineMonths} months — {member.goalUrgency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Email Status</p>
                              <p className="font-medium">
                                Welcome: {member.emailSent ? '✅' : '⏳'} ·
                                Day 3: {member.day3Sent ? '✅' : '⏳'} ·
                                Day 7: {member.day7Sent ? '✅' : '⏳'} ·
                                Day 30: {member.day30Sent ? '✅' : '⏳'}
                              </p>
                            </div>
                            {member.injuries && (
                              <div>
                                <p className="text-xs text-red-500 mb-0.5">⚠ Injuries</p>
                                <p className="font-medium text-red-700">{member.injuries}</p>
                              </div>
                            )}
                            {member.medicalConditions && (
                              <div>
                                <p className="text-xs text-red-500 mb-0.5">⚠ Medical</p>
                                <p className="font-medium text-red-700">{member.medicalConditions}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Gym config (read-only) */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Gym Settings (Read-only)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ['Gym Name', gymConfig.name],
              ['Slug', gymConfig.slug],
              ['Trainer', gymConfig.trainerName],
              ['Trainer Email', gymConfig.trainerEmail],
              ['Plan', gymConfig.plan],
              ['Status', gymConfig.isActive ? 'Active ✅' : 'Inactive ❌'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            To update settings, contact your GymSync administrator or edit directly in Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
