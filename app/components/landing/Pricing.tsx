'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    price: '₹2,499',
    desc: 'Up to 50 members/month',
    features: ['Member onboarding', 'AI meal plans', 'Email delivery', 'Google Sheets'],
  },
  {
    name: 'Growth',
    price: '₹4,999',
    desc: 'Up to 200 members/month',
    features: ['Everything in Starter', 'Follow-up sequences', 'Trainer brief PDF', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₹9,999',
    desc: 'Unlimited members',
    features: ['Everything in Growth', 'Custom domain', 'API access', 'Dedicated support'],
  },
];

export function Pricing() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
          Simple Pricing
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">No setup fees. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-8 border ${
              plan.highlight
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'
            } flex flex-col`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
            </div>
            <p className="text-sm text-gray-400 mb-8">{plan.desc}</p>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Check className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500'}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/demo-gym"
              className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center ${
                plan.highlight
                  ? 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white'
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
