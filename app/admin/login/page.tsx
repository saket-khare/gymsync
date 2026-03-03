'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [gymSlug, setGymSlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        gymSlug: gymSlug.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid gym slug or password. Please try again.');
      } else {
        router.push(`/admin/${gymSlug.trim()}`);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-gray-900">GymSync Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your gym dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Gym Slug</Label>
              <Input
                value={gymSlug}
                onChange={(e) => setGymSlug(e.target.value)}
                placeholder="e.g. iron-republic"
                required
                autoFocus
              />
              <p className="text-xs text-gray-400">
                This is your gym&apos;s URL identifier (e.g. gymsync.app/gym/iron-republic)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !gymSlug || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by GymSync
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Demo: slug <code className="bg-gray-100 px-1 rounded">demo-gym</code>, password <code className="bg-gray-100 px-1 rounded">gymsync2024</code> (after seeding Convex, or set DEMO_MODE=true)
        </p>
      </div>
    </main>
  );
}
