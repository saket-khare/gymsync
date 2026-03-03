import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-sm">
            GS
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">GymSync</span>
        </div>
        
        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#product" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Product</Link>
          <Link href="#resources" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Resources</Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/admin/login" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/demo-gym"
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
