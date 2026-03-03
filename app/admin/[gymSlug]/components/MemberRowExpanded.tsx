'use client';

import {
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  WarningIcon as AlertTriangle,
} from '@phosphor-icons/react';
import type { SheetRow } from '@/types';

interface MemberRowExpandedProps {
  member: SheetRow;
}

export function MemberRowExpanded({ member }: MemberRowExpandedProps) {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-6 sm:gap-y-8 text-sm">
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Demographics</p>
          <div>
            <p className="text-gray-800 dark:text-zinc-200 font-medium">
              {member.age} yrs <span className="text-gray-500 dark:text-zinc-600 font-normal mx-1">·</span>{' '}
              <span className="capitalize">{member.gender}</span>
            </p>
            <p className="text-gray-600 dark:text-zinc-400 text-xs mt-1">
              {member.weightKg}kg <span className="text-gray-400 dark:text-zinc-700 mx-1">·</span> {member.heightCm}
              cm
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Experience</p>
          <div>
            <p className="text-gray-800 dark:text-zinc-200 font-medium capitalize">
              {member.gymExperience.replace('_', ' ')}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-gray-600 dark:text-zinc-400 text-xs">Self-rated:</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-1.5 h-1.5 rounded-full ${
                      star <= member.selfRatedFitness ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
            Availability
          </p>
          <div>
            <p className="text-gray-800 dark:text-zinc-200 font-medium">{member.daysPerWeekAvailable}x / week</p>
            <p className="text-gray-600 dark:text-zinc-400 text-xs mt-1">
              {member.sessionDurationMinutes} min sessions
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Lifestyle</p>
          <div>
            <p className="text-gray-800 dark:text-zinc-200 font-medium capitalize">
              {member.dietType.replace('_', ' ')} Diet
            </p>
            <p className="text-gray-600 dark:text-zinc-400 text-xs mt-1">
              {member.sleepHoursPerNight}h sleep{' '}
              <span className="text-gray-400 dark:text-zinc-700 mx-1">·</span>{' '}
              <span className="capitalize">{member.occupationType.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Timeline</p>
          <div>
            <p className="text-gray-800 dark:text-zinc-200 font-medium">{member.timelineMonths} months</p>
            <p className="text-gray-600 dark:text-zinc-400 text-xs mt-1 capitalize">{member.goalUrgency} urgency</p>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-3">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Email Sequence Status
          </p>
          <div className="flex flex-wrap gap-2">
            <EmailStep sent={member.emailSent} label="Welcome" />
            <div className="hidden sm:flex items-center">
              <div className="w-3 h-px bg-gray-300 dark:bg-zinc-800" />
            </div>
            <EmailStep sent={member.day3Sent} label="Day 3 Check-in" />
            <div className="hidden sm:flex items-center">
              <div className="w-3 h-px bg-gray-300 dark:bg-zinc-800" />
            </div>
            <EmailStep sent={member.day7Sent} label="Day 7 Push" />
            <div className="hidden sm:flex items-center">
              <div className="w-3 h-px bg-gray-300 dark:bg-zinc-800" />
            </div>
            <EmailStep sent={member.day30Sent} label="Day 30 Review" />
          </div>
        </div>

        {(member.injuries || member.medicalConditions || member.foodAllergies) && (
          <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-2 pt-4 sm:pt-6 border-t border-gray-200 dark:border-zinc-800/40">
            <p className="text-xs font-medium text-rose-500/90 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Medical Considerations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {member.injuries && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                  <span className="text-[11px] font-medium text-rose-400/80 uppercase tracking-wider block mb-1">
                    Injuries
                  </span>
                  <span className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{member.injuries}</span>
                </div>
              )}
              {member.medicalConditions && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                  <span className="text-[11px] font-medium text-rose-400/80 uppercase tracking-wider block mb-1">
                    Conditions
                  </span>
                  <span className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
                    {member.medicalConditions}
                  </span>
                </div>
              )}
              {member.foodAllergies && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <span className="text-[11px] font-medium text-amber-500/70 uppercase tracking-wider block mb-1">
                    Food Allergies
                  </span>
                  <span className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
                    {member.foodAllergies}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailStep({ sent, label }: { sent: boolean; label: string }) {
  return (
    <div
      className={`px-2.5 py-1.5 rounded-md flex items-center gap-2 text-xs border transition-colors ${
        sent
          ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
          : 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-zinc-800/30 dark:border-zinc-800/50 dark:text-zinc-500'
      }`}
    >
      {sent ? (
        <CheckCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
      ) : (
        <Clock className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
}
