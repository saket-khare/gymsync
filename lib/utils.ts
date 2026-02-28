import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function goalLabel(goal: string): string {
  const labels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    aesthetic: 'Body Recomposition',
    athletic_performance: 'Athletic Performance',
    general_fitness: 'General Fitness',
    competition_prep: 'Competition Prep',
  };
  return labels[goal] ?? goal;
}

export function urgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    casual: "I'm in no rush",
    moderate: 'Steady and consistent',
    aggressive: 'I want results fast',
  };
  return labels[urgency] ?? urgency;
}

export function experienceLabel(exp: string): string {
  const labels: Record<string, string> = {
    complete_beginner: 'Complete Beginner',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[exp] ?? exp;
}

export function dietLabel(diet: string): string {
  const labels: Record<string, string> = {
    vegetarian: 'Vegetarian',
    non_vegetarian: 'Non-Vegetarian',
    vegan: 'Vegan',
    eggetarian: 'Eggetarian',
    keto: 'Keto',
    other: 'Other',
  };
  return labels[diet] ?? diet;
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityDays: number,
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const multipliers: Record<number, number> = {
    2: 1.375,
    3: 1.375,
    4: 1.55,
    5: 1.55,
    6: 1.725,
  };
  const multiplier = multipliers[activityDays] ?? 1.55;
  return Math.round(bmr * multiplier);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
}
