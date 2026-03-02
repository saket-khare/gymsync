import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import type { GymConfig } from '@/types';

// Module-level cache: slug → { config, fetchedAt }
const configCache = new Map<string, { config: GymConfig; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Demo Mode ──────────────────────────────────────────────
// When DEMO_MODE=true (or Convex is not configured), the app
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
  googleSheetId: '',
  isActive: true,
  plan: 'growth',
  createdAt: new Date().toISOString(),
};

function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_CONVEX_URL
  );
}

function convexGymToConfig(row: Record<string, unknown>): GymConfig {
  return {
    id: String(row._id ?? ''),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    logoUrl: String(row.logoUrl ?? ''),
    primaryColor: String(row.primaryColor ?? '#1A56DB'),
    trainerName: String(row.trainerName ?? ''),
    trainerEmail: String(row.trainerEmail ?? ''),
    adminEmail: String(row.adminEmail ?? ''),
    googleSheetId: String(row.googleSheetId ?? ''),
    isActive: Boolean(row.isActive ?? true),
    plan: (row.plan as GymConfig['plan']) ?? 'starter',
    createdAt: row.createdAt ? new Date(row.createdAt as number).toISOString() : '',
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
    const convex = getConvexClient();
    const gym = await convex.query(api.gyms.getBySlug, { slug });

    if (!gym) {
      return null;
    }

    const config = convexGymToConfig(gym as unknown as Record<string, unknown>);
    configCache.set(slug, { config, fetchedAt: Date.now() });
    return config;
  } catch (err) {
    console.error('[gym-config] Failed to fetch gym config:', err);
    return null;
  }
}

export async function getGymConfigByAdminEmail(email: string): Promise<GymConfig | null> {
  if (isDemoMode()) {
    if (email === DEMO_GYM_CONFIG.adminEmail) {
      return DEMO_GYM_CONFIG;
    }
    return null;
  }

  try {
    const convex = getConvexClient();
    const gym = await convex.query(api.gyms.getByAdminEmail, { email });

    if (!gym) return null;
    return convexGymToConfig(gym as unknown as Record<string, unknown>);
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
    const convex = getConvexClient();
    const gym = await convex.query(api.gyms.getBySlug, { slug });

    if (!gym) return null;
    return (gym as unknown as Record<string, unknown>).adminPasswordHash as string ?? '';
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
