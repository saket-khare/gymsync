'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// canvas-confetti is browser-only
let confettiLib: ((opts: Record<string, unknown>) => void) | null = null;
if (typeof window !== 'undefined') {
  import('canvas-confetti').then((m) => {
    confettiLib = m.default as (opts: Record<string, unknown>) => void;
  });
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get('name') ?? 'there';
  const launched = useRef(false);

  useEffect(() => {
    if (launched.current) return;
    launched.current = true;

    const timer = setTimeout(() => {
      if (confettiLib) {
        confettiLib({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#1A56DB', '#3B82F6', '#60A5FA', '#93C5FD', '#ffffff'],
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const whatsappMsg = encodeURIComponent(
    `I just started my fitness journey! 💪 Got a personalised meal plan from my gym. Time to get serious! 🏋️`,
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="w-full max-w-[480px] text-center">
        {/* Big emoji */}
        <div className="text-7xl mb-6">🎉</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You&apos;re all set, {firstName}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personalised meal plan lands in your inbox in about{' '}
          <strong>5 minutes</strong>.
        </p>

        {/* What to expect */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left space-y-4">
          <h2 className="font-bold text-gray-900 text-lg mb-2">What happens next:</h2>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-800">Check your email</p>
              <p className="text-sm text-gray-500">
                Your 7-day meal plan PDF will arrive within 5 minutes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-800">Save your trainer&apos;s contact</p>
              <p className="text-sm text-gray-500">
                Your trainer will reach out to schedule your first session.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-800">Start strong on Day 1</p>
              <p className="text-sm text-gray-500">
                Follow the meal plan from tomorrow. Even one good day builds momentum.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp share */}
        <a
          href={`https://wa.me/?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
        >
          <span className="text-xl">📲</span>
          Share your fitness journey on WhatsApp
        </a>

        <p className="text-xs text-gray-400 mt-6">
          Powered by <span className="font-semibold text-blue-600">GymSync</span>
        </p>
      </div>
    </main>
  );
}
