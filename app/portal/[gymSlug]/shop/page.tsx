'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jwtVerify } from 'jose';
import {
  LinkIcon as Link,
  ArrowLeftIcon as ArrowLeft,
  ArrowSquareOutIcon as ExternalLink,
} from '@phosphor-icons/react';
import { goalLabel } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  affiliateUrl: string;
  tag: string | null;
  goalTags: string[] | null;
}

export default function ShopPage() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [memberGoal, setMemberGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get member goal from portal JWT cookie via /api/portal/me
    Promise.all([
      fetch('/api/portal/me').then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/portal/affiliate-click?gymSlug=${gymSlug}`).then((r) =>
        r.ok ? r.json() : { products: [] }
      ),
    ]).then(([meData, shopData]) => {
      if (meData?.member?.primaryGoal) setMemberGoal(meData.member.primaryGoal);
      setProducts(shopData?.products ?? []);
    }).finally(() => setLoading(false));
  }, [gymSlug]);

  async function handleClick(product: Product) {
    // Log the click then open the link
    fetch('/api/portal/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, gymSlug }),
    }).catch(() => {});
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  }

  // Sort: products matching member's goal first
  const sorted = [...products].sort((a, b) => {
    const aMatch = memberGoal && a.goalTags?.includes(memberGoal) ? -1 : 0;
    const bMatch = memberGoal && b.goalTags?.includes(memberGoal) ? -1 : 0;
    return aMatch - bMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] font-sans">
      <header className="bg-white dark:bg-[#131316] border-b border-gray-200 dark:border-zinc-800/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Shop</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Recommended products for your goals
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Link className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-zinc-200">
              No products available yet
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Your gym hasn&apos;t added any recommended products yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberGoal && (
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Showing products relevant to your goal:{' '}
                <span className="font-medium text-gray-700 dark:text-zinc-300">
                  {goalLabel(memberGoal)}
                </span>
              </p>
            )}
            {sorted.map((product) => {
              const isRelevant = memberGoal && product.goalTags?.includes(memberGoal);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleClick(product)}
                  className="w-full text-left bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all flex items-start gap-4"
                >
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                      <Link className="w-6 h-6 text-gray-400 dark:text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {product.name}
                      </p>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {product.tag && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                          {product.tag}
                        </span>
                      )}
                      {isRelevant && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          Recommended for you
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
