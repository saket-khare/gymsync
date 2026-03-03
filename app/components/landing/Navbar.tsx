import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-sm">
            GS
          </div>
          <span className="font-bold text-white text-lg tracking-tight">GymSync</span>
        </div>
        
        {/* Center Links (New, like Linear) */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#product" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Product</Link>
          <Link href="#resources" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Resources</Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/admin/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/demo-gym"
            className="bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
