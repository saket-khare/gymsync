'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon as Plus,
  PencilSimpleIcon as Pencil,
  CheckIcon as Check,
  XIcon as Close,
  ArrowsClockwiseIcon as Refresh,
  ToggleLeftIcon as ToggleOff,
  ToggleRightIcon as ToggleOn,
  LinkIcon as Link,
  CursorClickIcon as CursorClick,
} from '@phosphor-icons/react';
import { goalLabel } from '@/lib/utils';

interface AffiliateProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  affiliateUrl: string;
  tag: string | null;
  goalTags: string[] | null;
  isActive: boolean;
  sortOrder: number;
}

interface ClickStat {
  productId: string;
  productName: string;
  clicks: number;
}

const GOAL_OPTIONS = [
  'weight_loss',
  'muscle_gain',
  'aesthetic',
  'athletic_performance',
  'general_fitness',
  'competition_prep',
];

const TAG_OPTIONS = ['protein', 'supplement', 'equipment', 'apparel', 'nutrition', 'other'];

interface Props {
  gymSlug: string;
}

export function AffiliateProductsPage({ gymSlug }: Props) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [clicks, setClicks] = useState<ClickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', description: '', imageUrl: '', affiliateUrl: '', tag: '', goalTags: [] as string[] };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/affiliate-products?gymSlug=${gymSlug}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProducts(data.products ?? []);
      setClicks(data.clicks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [gymSlug]);

  function clicksFor(id: string) {
    return clicks.find((c) => c.productId === id)?.clicks ?? 0;
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.affiliateUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/affiliate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          affiliateUrl: form.affiliateUrl.trim(),
          tag: form.tag || undefined,
          goalTags: form.goalTags.length > 0 ? form.goalTags : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setForm(emptyForm);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: AffiliateProduct) {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? '',
      affiliateUrl: p.affiliateUrl,
      tag: p.tag ?? '',
      goalTags: p.goalTags ?? [],
    });
  }

  async function handleEditSave(id: string) {
    if (!editForm.name.trim() || !editForm.affiliateUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/affiliate-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          imageUrl: editForm.imageUrl.trim() || undefined,
          affiliateUrl: editForm.affiliateUrl.trim(),
          tag: editForm.tag || undefined,
          goalTags: editForm.goalTags.length > 0 ? editForm.goalTags : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: AffiliateProduct) {
    await fetch('/api/admin/affiliate-products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !p.isActive } : x));
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E11] text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';
  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1';

  function GoalTagPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(value.includes(g) ? value.filter((x) => x !== g) : [...value, g])}
            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              value.includes(g)
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300'
            }`}
          >
            {goalLabel(g)}
          </button>
        ))}
      </div>
    );
  }

  function ProductForm({ f, setF, onSave, onCancel }: {
    f: typeof emptyForm;
    setF: (v: typeof emptyForm) => void;
    onSave: () => void;
    onCancel: () => void;
  }) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-[#0E0E11] border border-gray-200 dark:border-zinc-800 rounded-xl space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Product Name *</label>
            <input type="text" className={inputCls} placeholder="e.g. Optimum Nutrition Whey" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Tag / Category</label>
            <select className={inputCls} value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>
              <option value="">Select category</option>
              {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input type="text" className={inputCls} placeholder="Short description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Affiliate URL *</label>
            <input type="url" className={inputCls} placeholder="https://amzn.to/…" value={f.affiliateUrl} onChange={(e) => setF({ ...f, affiliateUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Product Image URL</label>
            <input type="url" className={inputCls} placeholder="https://…" value={f.imageUrl} onChange={(e) => setF({ ...f, imageUrl: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Relevant Goals (optional — show to these member types)</label>
          <GoalTagPicker value={f.goalTags} onChange={(v) => setF({ ...f, goalTags: v })} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button type="button" disabled={saving || !f.name.trim() || !f.affiliateUrl.trim()} onClick={onSave} className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Affiliate Products</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Add products to recommend to members. They appear in the member portal shop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

      {showAddForm && (
        <ProductForm
          f={form}
          setF={setForm}
          onSave={handleAdd}
          onCancel={() => { setShowAddForm(false); setForm(emptyForm); }}
        />
      )}

      {/* Products list */}
      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Refresh className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Link className="w-8 h-8 text-gray-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">No products yet</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Add affiliate products to display in the member portal.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
            {products.map((p) => {
              const isEditing = editingId === p.id;
              const totalClicks = clicksFor(p.id);
              return (
                <div key={p.id}>
                  {isEditing ? (
                    <div className="p-4">
                      <ProductForm
                        f={editForm}
                        setF={setEditForm}
                        onSave={() => handleEditSave(p.id)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4">
                      {/* Image */}
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-800 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                          <Link className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${p.isActive ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-400 dark:text-zinc-500 line-through'}`}>
                              {p.name}
                            </p>
                            {p.description && (
                              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{p.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500 mr-2">
                              <CursorClick className="w-3.5 h-3.5" />
                              {totalClicks}
                            </div>
                            <button type="button" onClick={() => startEdit(p)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => toggleActive(p)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title={p.isActive ? 'Archive' : 'Activate'}>
                              {p.isActive ? <ToggleOn className="w-4 h-4 text-emerald-500" /> : <ToggleOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.tag && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                              {p.tag}
                            </span>
                          )}
                          {p.goalTags?.map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {goalLabel(g)}
                            </span>
                          ))}
                        </div>
                        <a
                          href={p.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 mt-1.5 truncate max-w-xs"
                        >
                          <Link className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.affiliateUrl}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
