'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Mail, Smartphone, Table, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: <Smartphone className="w-6 h-6 text-blue-400" />,
    title: 'Beautiful Onboarding',
    desc: 'Mobile-first 6-step form that members actually enjoy filling out.',
    colSpan: 'col-span-1 md:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    icon: <Bot className="w-6 h-6 text-purple-400" />,
    title: 'AI Meal Plans',
    desc: 'GPT-4o generates a personalised 7-day Indian meal plan for each member.',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-2',
    interactive: true,
  },
  {
    icon: <FileText className="w-6 h-6 text-green-400" />,
    title: 'Trainer Brief',
    desc: 'One-page AI summary gives trainers everything they need before session 1.',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
  },
  {
    icon: <Mail className="w-6 h-6 text-orange-400" />,
    title: 'Auto Email Delivery',
    desc: 'Plans delivered in 5 minutes. 30-day follow-up sequence included.',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
  },
  {
    icon: <Table className="w-6 h-6 text-emerald-400" />,
    title: 'Google Sheets',
    desc: 'All member data syncs to a Google Sheet your staff already knows.',
    colSpan: 'col-span-1 md:col-span-2',
    rowSpan: 'row-span-1',
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-400" />,
    title: 'Multi-Tenant',
    desc: 'Each gym gets a branded URL. One codebase, unlimited gyms.',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
  },
];

const AI_TEXT = "Generating meal plan...\n\nBreakfast: Poha with veggies & peanuts (350 kcal)\nLunch: 2 Roti, Dal, Paneer, Salad (450 kcal)\nSnack: Greek Yogurt & Almonds (200 kcal)\nDinner: Grilled Chicken, Quinoa, Broccoli (400 kcal)\n\nMacros: 120g Protein | 150g Carbs | 50g Fat";

function InteractiveAIBox() {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(AI_TEXT.slice(0, i));
      i++;
      if (i > AI_TEXT.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => {
          i = 0;
          setText('');
          setIsTyping(true);
        }, 3000);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 h-48 overflow-hidden relative">
      <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-gray-500">gymsync-ai-agent</span>
      </div>
      <div className="whitespace-pre-wrap">
        {text}
        {isTyping && <span className="inline-block w-2 h-3 bg-purple-400 ml-1 animate-pulse" />}
      </div>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Everything your gym needs
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Built for purpose. Designed for speed. Powered by AI agents to automate the manual work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors ${f.colSpan} ${f.rowSpan} flex flex-col`}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/5">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              
              {f.interactive && <InteractiveAIBox />}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
