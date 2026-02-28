import { createClient } from '@supabase/supabase-js';
import type { GymConfig } from '@/types';

// Module-level cache: slug → { config, fetchedAt }
const configCache = new Map<string, { config: GymConfig; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Demo Mode ──────────────────────────────────────────────
// When DEMO_MODE=true (or Supabase is not configured), the app
// serves a hardcoded demo gym config so you can test the UI
// without any external services.
const DEMO_GYM_CONFIG: GymConfig = {
  id: 'demo-000-0000-0000-000000000001',
  slug: 'demo-gym',
  name: 'Demo Fitness Hub',
  logoUrl: '',
  primaryColor: '#1A56DB',
  trainerName: 'Rahul Sharma',
  trainerEmail: 'akarshcreate@gmail.com',
  adminEmail: 'akarshcreate@gmail.com',
  googleSheetId: '1ch_3Alo-b9iTIIc-7DYzqkCs1UV3JP9iAoPB0P21ct8',
  isActive: true,
  plan: 'growth',
  createdAt: new Date().toISOString(),
};

function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, key);
}

function rowToGymConfig(row: Record<string, unknown>): GymConfig {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    logoUrl: String(row.logo_url ?? ''),
    primaryColor: String(row.primary_color ?? '#1A56DB'),
    trainerName: String(row.trainer_name ?? ''),
    trainerEmail: String(row.trainer_email ?? ''),
    adminEmail: String(row.admin_email ?? ''),
    googleSheetId: String(row.google_sheet_id ?? ''),
    isActive: Boolean(row.is_active ?? true),
    plan: (row.plan as GymConfig['plan']) ?? 'starter',
    createdAt: String(row.created_at ?? ''),
  };
}

export async function getGymConfig(slug: string): Promise<GymConfig | null> {
  // Demo mode: return hardcoded config for any slug
  if (isDemoMode()) {
    return { ...DEMO_GYM_CONFIG, slug };
  }

  const cached = configCache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.config;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('[gym-config] Supabase error:', error?.message ?? 'No data');
      return null;
    }

    const config = rowToGymConfig(data as Record<string, unknown>);
    configCache.set(slug, { config, fetchedAt: Date.now() });
    return config;
  } catch (err) {
    console.error('[gym-config] Failed to fetch gym config:', err);
    return null;
  }
}

export async function getGymConfigByAdminEmail(email: string): Promise<GymConfig | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('admin_email', email)
      .single();

    if (error || !data) return null;
    return rowToGymConfig(data as Record<string, unknown>);
  } catch (err) {
    console.error('[gym-config] Failed to fetch gym by admin email:', err);
    return null;
  }
}

export async function getGymPasswordHash(slug: string): Promise<string | null> {
  // Demo mode: return a hardcoded bcrypt hash for password "gymsync2024"
  if (isDemoMode()) {
    return '$2b$10$yys45zTUhDkydfK3d3cUFe.wlXnabmCkTOVgkIRYXoryhsYkWKodG';
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('gyms')
      .select('admin_password_hash')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return String((data as Record<string, unknown>).admin_password_hash ?? '');
  } catch (err) {
    console.error('[gym-config] Failed to fetch password hash:', err);
    return null;
  }
}

export function invalidateGymCache(slug: string): void {
  configCache.delete(slug);
}

// Public-safe subset of GymConfig (no credentials)
export type PublicGymConfig = Omit<GymConfig, 'googleSheetId' | 'adminEmail'>;

export function toPublicConfig(config: GymConfig): PublicGymConfig {
  const { googleSheetId: _, adminEmail: __, ...publicFields } = config;
  return publicFields;
}
