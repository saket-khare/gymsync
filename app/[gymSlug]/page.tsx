import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGymConfig } from '@/lib/gym-config';
import OnboardingForm from '@/components/form/OnboardingForm';
import type { GymConfig } from '@/types';

interface Props {
  params: Promise<{ gymSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gymSlug } = await params;
  const config = await getGymConfig(gymSlug);
  if (!config) return { title: 'GymSync' };
  return {
    title: `Join ${config.name} — Member Onboarding`,
    description: `Get your personalised fitness and meal plan from ${config.name}.`,
  };
}

export default async function GymOnboardingPage({ params }: Props) {
  const { gymSlug } = await params;
  const config = await getGymConfig(gymSlug);

  if (!config) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gym Not Found</h1>
          <p className="text-gray-500">
            This gym isn&apos;t set up on GymSync yet. If you believe this is an error, please
            contact the gym directly.
          </p>
        </div>
      </main>
    );
  }

  if (!config.isActive) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Available</h1>
          <p className="text-gray-500">
            {config.name}&apos;s onboarding portal is temporarily unavailable. Please contact
            the gym for assistance.
          </p>
        </div>
      </main>
    );
  }

  const primaryColor = config.primaryColor ?? '#1A56DB';
  const rgb = hexToRgbValues(primaryColor);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{
        background: `linear-gradient(180deg, ${primaryColor}0d 0%, #f9fafb 100%)`,
      }}
    >
      {/* Gym header */}
      <div className="w-full max-w-[480px] flex items-center gap-3 mb-6">
        {config.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.logoUrl}
            alt={config.name}
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {config.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{config.name}</h1>
          <p className="text-xs text-gray-500">Member Onboarding</p>
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <OnboardingForm gymConfig={config} />
      </div>

      {/* Powered by */}
      <p className="mt-6 text-xs text-gray-400">
        Powered by{' '}
        <span className="font-semibold" style={{ color: primaryColor }}>
          GymSync
        </span>
      </p>
    </main>
  );
}

function hexToRgbValues(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '26, 86, 219';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
