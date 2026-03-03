'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bot, CheckCircle2, FileText, Loader2, Sparkles } from 'lucide-react';

export function Hero() {
  const [step, setStep] = useState(0);

  // Auto-advance the interactive demo for the hero
  useEffect(() => {
    if (step === 0) return;
    
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(timer);
    }
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 2000);
      return () => clearTimeout(timer);
    }
    if (step === 3) {
      const timer = setTimeout(() => setStep(0), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <section className="relative pt-40 pb-20 px-6 w-full flex flex-col min-h-[90vh] justify-center items-center">
      {/* Linear has a very dark, un-glowing background for the main hero text. Removing the heavy blue glow. */}
      
      <div className="w-full max-w-7xl mx-auto flex flex-col items-start text-left mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <h1 className="text-[3rem] md:text-[4.5rem] lg:text-[5rem] font-medium text-white tracking-[-0.04em] text-balance leading-[1.05] mb-12">
            The onboarding 
            system for gyms
            and members
          </h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6 pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <p className="text-base md:text-lg text-[#8A8F98]">
                Purpose-built for independent gyms. Designed for the AI era.
              </p>
              
              <Link href="/demo-gym" className="group hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#F2F2F2] transition-all">
                Get started
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            <Link href="/updates" className="text-[14px] text-[#8A8F98] hover:text-white transition-colors flex items-center gap-2">
              <span className="text-white font-medium">New</span> GymSync AI Plans (Beta) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {/* Mobile CTA (shown only on small screens below the text) */}
          <Link href="/demo-gym" className="group md:hidden inline-flex items-center gap-2 bg-white text-black px-6 py-3 mt-2 rounded-full text-[15px] font-medium hover:bg-[#F2F2F2] transition-all w-fit">
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Interactive Demo Box (Styled like Linear's app window) */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-7xl mx-auto bg-[#1A1A1A] rounded-xl border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Fake app header */}
        <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm bg-white flex items-center justify-center text-[7px] font-bold text-black">GS</div>
            <span className="text-[13px] font-medium text-gray-300">GymSync</span>
            <span className="text-gray-600 text-[13px] ml-1">v</span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <div className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-pointer">⌕</div>
            <div className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-pointer">◧</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[500px]">
          {/* Sidebar */}
          <div className="hidden md:block border-r border-white/5 bg-[#141414] p-3 pt-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-gray-500 px-3 pb-2 uppercase tracking-wider">Workspace</div>
              <div className="px-3 py-1.5 rounded-md bg-white/5 text-[13px] font-medium text-white flex items-center justify-between cursor-pointer">
                Members <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">145</span>
              </div>
              <div className="px-3 py-1.5 text-[13px] text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-md cursor-pointer">AI Plans</div>
              <div className="px-3 py-1.5 text-[13px] text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-md cursor-pointer">Trainers</div>
            </div>
            
            <div className="space-y-0.5 mt-8">
              <div className="text-[11px] font-medium text-gray-500 px-3 pb-2 uppercase tracking-wider flex justify-between items-center">
                Favorites <span className="text-gray-600">▾</span>
              </div>
              <div className="px-3 py-1.5 text-[13px] text-[#FFD02B] flex items-center gap-2 cursor-pointer">
                 <div className="w-1.5 h-1.5 rounded-full border border-[#FFD02B]" />
                 Faster onboarding
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-[#111111] relative overflow-hidden flex flex-col">
            {/* Top bar inside main content */}
            <div className="h-10 border-b border-white/5 flex items-center px-6 gap-3 text-[13px]">
              <span className="text-gray-400">Faster onboarding</span>
              <span className="text-[#FFD02B]">★</span>
              <div className="flex-1" />
              <span className="text-gray-500 text-[11px]">02 / 145</span>
            </div>
            
            <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-2xl text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[22px] font-medium text-white">Faster onboarding</h3>
                  </div>
                  <p className="text-[#8A8F98] text-[14px] mb-8 leading-relaxed max-w-xl">
                    Render personalized AI plans immediately when minimum required state is present, instead of blocking on full trainer review during member startup.
                  </p>
                  
                  <div className="mb-6">
                     <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-5">Activity</div>
                     
                     <div className="space-y-6">
                       <div className="flex gap-4">
                         <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-[9px] text-white font-medium">GS</span>
                         </div>
                         <div>
                           <div className="text-[13px] text-gray-300">
                             <span className="text-white font-medium">GymSync</span> created the issue via App on behalf of member <span className="text-gray-500">· 2min ago</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex gap-4">
                         <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                           <Bot className="w-3.5 h-3.5 text-blue-400" />
                         </div>
                         <div className="w-full">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="text-[13px] text-white font-medium">GymSync Agent</span>
                             <span className="text-[13px] text-gray-500">· just now</span>
                           </div>
                           <div className="bg-[#1A1A1A] border border-white/5 rounded-lg p-4 inline-block w-full max-w-md shadow-sm">
                             <p className="text-[13px] text-gray-300 mb-4">I can take a stab at generating this meal plan and trainer brief based on the new member's form.</p>
                             <button 
                              onClick={() => setStep(1)}
                              className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-md text-[13px] font-medium transition-colors shadow-sm"
                            >
                              Generate Plans
                            </button>
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-xl"
                >
                  {/* Linear Agent Popover Mockup */}
                  <div className="bg-[#1C1C1C] border border-white/10 rounded-xl shadow-2xl p-4 ml-auto max-w-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                          <Bot className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white">GymSync Agent</span>
                      </div>
                      <span className="text-gray-500 text-xs">esc</span>
                    </div>
                    <p className="text-xs text-[#8A8F98] mb-4">
                      I'll start by exploring the member's fitness data to understand their goals and then generate the required meal plans and trainer briefs.
                    </p>
                    <div className="bg-black/50 rounded font-mono text-[11px] text-gray-400 p-3 mb-4">
                      <div className="flex items-center gap-2 text-[#FFD02B] mb-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Fetching member preferences...
                      </div>
                      <div className="text-gray-500 ml-5">Goal: Lose Weight</div>
                      <div className="text-gray-500 ml-5">Diet: Vegetarian</div>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-medium transition-colors">
                      Cancel Generation
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-xl"
                >
                  <div className="bg-[#1C1C1C] border border-white/10 rounded-xl shadow-2xl p-4 ml-auto max-w-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                          <Bot className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white">GymSync Agent</span>
                      </div>
                    </div>
                    <div className="bg-black/50 rounded font-mono text-[11px] text-gray-400 p-3">
                      <div className="text-gray-500 mb-1">✔ Member preferences fetched</div>
                      <div className="flex items-center gap-2 text-green-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Writing personalized meal plan...
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-xl text-left"
                >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-4 h-4 text-green-400" />
                     </div>
                     <div>
                       <div className="text-[13px] text-gray-300">
                         <span className="text-white font-medium">GymSync Agent</span> resolved the issue <span className="text-gray-500">· just now</span>
                       </div>
                     </div>
                   </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 rounded border border-white/5 bg-[#1A1A1A] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-[13px] text-gray-300">Weight_Loss_Plan.pdf</span>
                      </div>
                      <span className="text-[11px] text-[#8A8F98]">Emailed to member</span>
                    </div>
                    <div className="p-3 rounded border border-white/5 bg-[#1A1A1A] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-[13px] text-gray-300">Trainer_Brief_John.pdf</span>
                      </div>
                      <span className="text-[11px] text-[#8A8F98]">Saved to Dashboard</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
