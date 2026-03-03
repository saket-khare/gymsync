import {
  getGymBySlug,
  getGymByAdminEmail,
  getGymPasswordHash as getDbPasswordHash,
  gymRowToConfig,
} from '@/lib/db';
import type { GymConfig } from '@/types';

// Module-level cache: slug → { config, fetchedAt }
const configCache = new Map<string, { config: GymConfig; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Demo Mode ──────────────────────────────────────────────
// When DEMO_MODE=true or DATABASE_URL is not set, the app
// serves a hardcoded demo gym config so you can test the UI
// without any database.
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
    !process.env.DATABASE_URL
  );
}

export async function getGymConfig(slug: string): Promise<GymConfig | null> {
  if (isDemoMode()) {
    return { ...DEMO_GYM_CONFIG, slug };
  }

  const cached = configCache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.config;
  }

  try {
    const gym = await getGymBySlug(slug);
    if (!gym) return null;
    const config = gymRowToConfig(gym);
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
    const gym = await getGymByAdminEmail(email);
    if (!gym) return null;
    return gymRowToConfig(gym);
  } catch (err) {
    console.error('[gym-config] Failed to fetch gym by admin email:', err);
    return null;
  }
}

export async function getGymPasswordHash(slug: string): Promise<string | null> {
  if (isDemoMode()) {
    return '$2b$10$yys45zTUhDkydfK3d3cUFe.wlXnabmCkTOVgkIRYXoryhsYkWKodG';
  }
  try {
    return await getDbPasswordHash(slug);
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
