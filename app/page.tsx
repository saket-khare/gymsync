import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GymSync — AI-Powered Gym Member Onboarding',
  description:
    'Replace paper onboarding forms with a beautiful digital flow. Deliver personalised meal plans and trainer briefs in minutes.',
};

const FEATURES = [
  {
    icon: '📋',
    title: 'Beautiful Onboarding',
    desc: 'Mobile-first 6-step form that members actually enjoy filling out.',
  },
  {
    icon: '🤖',
    title: 'AI Meal Plans',
    desc: 'GPT-4o generates a personalised 7-day Indian meal plan for each member.',
  },
  {
    icon: '📊',
    title: 'Trainer Brief',
    desc: 'One-page AI summary gives trainers everything they need before session 1.',
  },
  {
    icon: '📧',
    title: 'Auto Email Delivery',
    desc: 'Plans delivered in 5 minutes. 30-day follow-up sequence included.',
  },
  {
    icon: '📝',
    title: 'Google Sheets',
    desc: 'All member data syncs to a Google Sheet your staff already knows.',
  },
  {
    icon: '🏪',
    title: 'Multi-Tenant',
    desc: 'Each gym gets a branded URL. One codebase, unlimited gyms.',
  },
];

const STEPS = [
  { n: '1', title: 'Share your URL', desc: 'gymsync.app/your-gym-name' },
  { n: '2', title: 'Member fills form', desc: '5 minute onboarding on mobile' },
  { n: '3', title: 'AI generates plan', desc: 'Meal plan + trainer brief in ~5 min' },
  { n: '4', title: 'Auto email delivery', desc: 'Member & trainer both get PDFs' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            GS
          </div>
          <span className="font-bold text-gray-900 text-lg">GymSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
            Admin Login
          </Link>
          <Link
            href="/demo-gym"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
          🚀 Now in beta — 50 gyms onboard
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          AI-powered onboarding
          <br />
          <span className="text-blue-600">for independent gyms</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Replace paper forms with a beautiful mobile flow. Every new member gets a
          personalised meal plan and trainer brief delivered in 5 minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/demo-gym"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            See Live Demo →
          </Link>
          <a
            href="mailto:hello@gymsync.app"
            className="w-full sm:w-auto border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Everything your gym needs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Simple Pricing</h2>
          <p className="text-center text-gray-500 mb-10">No setup fees. Cancel anytime.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
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
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border-2 ${
                  plan.highlight
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div
                  className={`text-3xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
                >
                  {plan.price}
                  <span className="text-sm font-normal opacity-70">/mo</span>
                </div>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm flex items-center gap-2 ${
                        plan.highlight ? 'text-blue-50' : 'text-gray-600'
                      }`}
                    >
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@gymsync.app"
                  className={`mt-5 block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to modernise your gym?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Set up in under 10 minutes. Your first member onboarding flow will be live today.
        </p>
        <Link
          href="/demo-gym"
          className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Experience the Demo →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} GymSync. Built for independent gym owners.
        </p>
      </footer>
    </div>
  );
}
