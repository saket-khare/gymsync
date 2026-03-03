'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CaretDownIcon as ChevronDown,
  CaretUpIcon as ChevronUp,
  CaretUpDownIcon as SortIcon,
  ActivityIcon as Activity,
  WarningIcon as AlertTriangle,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  BarbellIcon as Dumbbell,
} from '@phosphor-icons/react';
import { formatDateTime, goalLabel, dietLabel } from '@/lib/utils';
import type { GymConfig, SheetRow } from '@/types';
import { STATUS_STYLES } from './constants';
import { MemberRowExpanded } from './MemberRowExpanded';

export type SortKey = 'name' | 'goal' | 'diet' | 'submitted';
export type SortDir = 'asc' | 'desc';

interface MembersTableProps {
  members: SheetRow[];
  gymConfig: GymConfig;
  expandedRow: string | null;
  onExpandToggle: (rowId: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortHeader({
  label,
  sortKeyForColumn,
  currentSortKey,
  sortDir,
  onSort,
}: {
  label: string;
  sortKeyForColumn: SortKey;
  currentSortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSortKey === sortKeyForColumn;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKeyForColumn)}
      className="flex items-center gap-1 font-medium hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
    >
      {label}
      {isActive ? (
        sortDir === 'asc' ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )
      ) : (
        <SortIcon className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );
}

export function MembersTable({
  members,
  gymConfig,
  expandedRow,
  onExpandToggle,
  sortKey,
  sortDir,
  onSort,
}: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-zinc-800">
            <Dumbbell className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">No members found</h3>
          <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1 max-w-sm">
            Share your gym's URL to start collecting member profiles and generating plans.
          </p>
          <div className="mt-6 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-[#0E0E11] border border-gray-200 dark:border-zinc-800/80 rounded-md inline-block max-w-full overflow-x-auto">
            <code className="text-[11px] sm:text-xs text-gray-600 dark:text-zinc-400 font-mono break-all">
              {typeof window !== 'undefined' ? window.location.origin : 'https://gymsync.app'}/
              {gymConfig.slug}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
      {/* Mobile: card layout */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-zinc-800/40">
        <AnimatePresence>
          {members.map((member) => {
            const isExpanded = expandedRow === member.rowId;
            return (
              <div key={member.rowId}>
                <motion.div
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 cursor-pointer transition-colors touch-manipulation ${
                    isExpanded
                      ? 'bg-gray-100 dark:bg-[#18181b]'
                      : 'active:bg-gray-100 dark:active:bg-[#18181b]/60'
                  }`}
                  onClick={() => onExpandToggle(member.rowId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800/80 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50 shrink-0">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-zinc-200 truncate">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500 truncate">
                          {member.email}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-gray-600 dark:text-zinc-400">
                            {goalLabel(member.primaryGoal)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-500">
                            {dietLabel(member.dietType)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              STATUS_STYLES[member.processingStatus] ?? ''
                            }`}
                          >
                            {member.processingStatus === 'processing' && (
                              <Activity className="w-3 h-3 animate-pulse shrink-0" />
                            )}
                            {member.processingStatus === 'processed' && (
                              <CheckCircle className="w-3 h-3 shrink-0" />
                            )}
                            {member.processingStatus === 'pending' && (
                              <Clock className="w-3 h-3 shrink-0" />
                            )}
                            {member.processingStatus === 'failed' && (
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                            )}
                            {member.processingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] text-gray-500 dark:text-zinc-500 tabular-nums">
                        {member.submittedAt ? formatDateTime(member.submittedAt) : '—'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
                      )}
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key={`${member.rowId}-expanded`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden bg-gray-50 dark:bg-[#0E0E11]/50 border-y border-gray-200 dark:border-zinc-800/40"
                    >
                      <MemberRowExpanded member={member} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800/60 text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider bg-gray-50 dark:bg-[#18181b]/50">
              <th className="px-6 py-3">
                <SortHeader
                  label="Member"
                  sortKeyForColumn="name"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3">
                <SortHeader
                  label="Goal"
                  sortKeyForColumn="goal"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3">
                <SortHeader
                  label="Diet"
                  sortKeyForColumn="diet"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3">
                <SortHeader
                  label="Submitted"
                  sortKeyForColumn="submitted"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 font-medium text-right w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/40">
            <AnimatePresence>
              {members.map((member) => {
                const isExpanded = expandedRow === member.rowId;
                return (
                  <Fragment key={member.rowId}>
                    <motion.tr
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, filter: 'blur(4px)' }}
                      transition={{ duration: 0.2 }}
                      className={`group cursor-pointer transition-colors ${
                        isExpanded
                          ? 'bg-gray-100 dark:bg-[#18181b]'
                          : 'hover:bg-gray-50 dark:hover:bg-[#18181b]/60'
                      }`}
                      onClick={() => onExpandToggle(member.rowId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800/80 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50">
                            {member.firstName.charAt(0)}
                            {member.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-zinc-200 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">
                          {goalLabel(member.primaryGoal)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-zinc-400">
                          {dietLabel(member.dietType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            STATUS_STYLES[member.processingStatus] ?? ''
                          }`}
                        >
                          {member.processingStatus === 'processing' && (
                            <Activity className="w-3 h-3 animate-pulse" />
                          )}
                          {member.processingStatus === 'processed' && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {member.processingStatus === 'pending' && (
                            <Clock className="w-3 h-3" />
                          )}
                          {member.processingStatus === 'failed' && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {member.processingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-zinc-500 tabular-nums">
                        {member.submittedAt ? formatDateTime(member.submittedAt) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExpandToggle(member.rowId);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${member.rowId}-expanded`}
                          layout="position"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={6} className="p-0 border-b-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden bg-gray-50 dark:bg-[#0E0E11]/50 border-y border-gray-200 dark:border-zinc-800/40 shadow-inner"
                            >
                              <MemberRowExpanded member={member} />
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
