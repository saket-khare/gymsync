import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { FeaturesBento } from './components/landing/FeaturesBento';
import { Pricing } from './components/landing/Pricing';

export const metadata: Metadata = {
  title: 'GymSync — AI-Powered Gym Member Onboarding',
  description:
    'Replace paper onboarding forms with a beautiful digital flow. Deliver personalised meal plans and trainer briefs in minutes.',
};

import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <main className="relative overflow-hidden">
        <Hero />
        
        {/* Divider */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-12" />
        
        <FeaturesBento />
        
        {/* Divider */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-12" />
        
        <Pricing />
        
        {/* CTA Section */}
        <section className="py-32 px-6 text-center relative overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
          <h2 className="text-4xl md:text-[4rem] font-medium text-white tracking-[-0.02em] leading-tight mb-10">
            Built for the future. <br className="hidden sm:block" />
            <span className="text-gray-500">Available today.</span>
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo-gym"
              className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:hello@gymsync.app"
              className="px-6 py-3 rounded-full font-medium text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              Contact sales
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-bold text-[10px]">
              GS
            </div>
            <span className="font-semibold text-white text-sm">GymSync</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GymSync. Built for independent gym owners.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
