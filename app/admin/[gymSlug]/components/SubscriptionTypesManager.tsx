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
} from '@phosphor-icons/react';

interface SubscriptionType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
}

const PRESET_COLORS = [
  '#5E6AD2', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
];

interface Props {
  gymSlug: string;
}

export function SubscriptionTypesManager({ gymSlug }: Props) {
  const [types, setTypes] = useState<SubscriptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New type form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  async function fetchTypes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscription-types?gymSlug=${gymSlug}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTypes(data.types ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading types');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymSlug]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/subscription-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined, color: newColor }),
      });
      if (!res.ok) throw new Error('Failed to create');
      setNewName('');
      setNewDesc('');
      setNewColor(PRESET_COLORS[0]);
      setShowAddForm(false);
      fetchTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(t: SubscriptionType) {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDesc(t.description ?? '');
    setEditColor(t.color);
  }

  async function handleEditSave(id: string) {
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/subscription-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName.trim(), description: editDesc.trim() || undefined, color: editColor }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingId(null);
      fetchTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleToggleActive(t: SubscriptionType) {
    try {
      await fetch('/api/admin/subscription-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, isActive: !t.isActive }),
      });
      setTypes((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: !t.isActive } : x)));
    } catch {
      setError('Failed to update status');
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E11] text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1';

  return (
    <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Subscription Types
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Define what members can subscribe to (Gym, Zumba, Meal Plan, etc.)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Type
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-3">{error}</p>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-[#0E0E11] border border-gray-200 dark:border-zinc-800 rounded-xl space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">New Subscription Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Gym Membership, Zumba, Meal Plan"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Optional short description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    newColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-800 cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !newName.trim()}
              onClick={handleAdd}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Refresh className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 dark:text-zinc-400">
          No subscription types yet. Add one to get started.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
          {types.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <div key={t.id} className="py-3 first:pt-0 last:pb-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Color</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              editColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-6 h-6 rounded-full border border-gray-200 dark:border-zinc-800 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Close className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={editSaving || !editName.trim()}
                        onClick={() => handleEditSave(t.id)}
                        className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            t.isActive
                              ? 'text-gray-900 dark:text-zinc-100'
                              : 'text-gray-400 dark:text-zinc-500 line-through'
                          }`}
                        >
                          {t.name}
                        </p>
                        {t.description && (
                          <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        title={t.isActive ? 'Archive' : 'Activate'}
                      >
                        {t.isActive ? (
                          <ToggleOn className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ToggleOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
