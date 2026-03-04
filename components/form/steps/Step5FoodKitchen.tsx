'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  WHAT_DO_YOU_EAT,
  CANT_EAT_OPTIONS,
  WHO_PREPARES_MEALS,
  COOKING_ELABORATION,
  SUPPLEMENTS_OPEN_OPTIONS,
  STEP_META,
} from '@/lib/onboarding-steps';
import {
  Leaf,
  Egg,
  Fish,
  Cow,
  Plant,
  Drop,
  Check,
  Pepper,
  Grains,
  Carrot,
  House,
  CookingPot,
  Buildings,
  Package,
  Shuffle,
  CheckCircle,
  Flame,
  SealCheck,
} from '@phosphor-icons/react';

interface Step5FoodKitchenProps {
  primaryColor?: string;
}

const EAT_ICONS: Record<string, React.ElementType> = {
  vegetarian: Leaf,
  eggs: Egg,
  chicken_fish: Fish,
  red_meat: Cow,
  vegan: Plant,
  dairy: Drop,
};

const CANT_EAT_ICONS: Record<string, React.ElementType> = {
  fish_seafood: Fish,
  spicy: Pepper,
  onion_garlic: Flame,
  dairy_upset: Drop,
  wheat_gluten: Grains,
  picky_veg: Carrot,
  none: Check,
};

const WHO_PREPARES_ICONS: Record<string, React.ElementType> = {
  someone_home: House,
  self: CookingPot,
  hostel: Buildings,
  order_in: Package,
  mix: Shuffle,
};

export default function Step5FoodKitchen({ primaryColor = '#1A56DB' }: Step5FoodKitchenProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const whatDoYouEat: string[] = watch('whatDoYouEat') ?? [];
  const cantEat: string[] = watch('cantEat') ?? [];
  const whoPreparesMeals = watch('whoPreparesMeals');
  const supplementsOpen = watch('supplementsOpen');
  const cookingElaboration = watch('cookingElaboration');

  const showCookingQuestion = whoPreparesMeals && !['hostel', 'order_in'].includes(whoPreparesMeals);

  function toggleEat(value: string) {
    const updated = whatDoYouEat.includes(value)
      ? whatDoYouEat.filter((v) => v !== value)
      : [...whatDoYouEat, value];
    setValue('whatDoYouEat', updated, { shouldValidate: true });
  }

  function toggleCantEat(value: string) {
    if (value === 'none') {
      // "None" clears everything else
      setValue('cantEat', cantEat.includes('none') ? [] : ['none'], { shouldValidate: true });
      return;
    }
    // Remove 'none' if selecting something specific
    const withoutNone = cantEat.filter((v) => v !== 'none');
    const updated = withoutNone.includes(value)
      ? withoutNone.filter((v) => v !== value)
      : [...withoutNone, value];
    setValue('cantEat', updated, { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[4].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[4].subtitle}</p>
      </div>

      {/* What do you eat — multi-select */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          What do you eat? <span className="text-gray-400 font-normal">Select all that apply</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {WHAT_DO_YOU_EAT.map((opt) => {
            const Icon = EAT_ICONS[opt.value];
            const isSelected = whatDoYouEat.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleEat(opt.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle size={18} weight="fill" style={{ color: primaryColor }} />
                  ) : (
                    Icon && <Icon size={18} weight="bold" className="text-gray-400 dark:text-zinc-500" />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.whatDoYouEat && (
          <p className="text-xs text-red-500">{String(errors.whatDoYouEat.message)}</p>
        )}
      </div>

      {/* Can't eat — multi-select */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Anything you can&apos;t eat or strongly dislike?{' '}
          <span className="text-gray-400 font-normal">Select all that apply</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {CANT_EAT_OPTIONS.map((opt) => {
            const Icon = CANT_EAT_ICONS[opt.value];
            const isSelected = cantEat.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleCantEat(opt.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle size={16} weight="fill" style={{ color: primaryColor }} />
                  ) : (
                    Icon && <Icon size={16} weight="bold" className="text-gray-400 dark:text-zinc-500" />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Who prepares meals */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Who prepares your meals?</Label>
        <div className="space-y-2">
          {WHO_PREPARES_MEALS.map((opt) => {
            const Icon = WHO_PREPARES_ICONS[opt.value];
            const isSelected = whoPreparesMeals === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('whoPreparesMeals', opt.value, { shouldValidate: true })}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                {Icon && (
                  <Icon
                    size={18}
                    weight="bold"
                    className="shrink-0"
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <span
                  className="text-sm font-medium"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.whoPreparesMeals && (
          <p className="text-xs text-red-500">{String(errors.whoPreparesMeals.message)}</p>
        )}
      </div>

      {/* Cooking elaboration — conditional */}
      {showCookingQuestion && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            How elaborate can the cooking get?
          </Label>
          <div className="space-y-2">
            {COOKING_ELABORATION.map((opt) => {
              const isSelected = cookingElaboration === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('cookingElaboration', opt.value, { shouldValidate: true })}
                  className={cn(
                    'w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? ''
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                  )}
                  style={
                    isSelected
                      ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                      : {}
                  }
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplements open */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Open to protein supplements?
        </Label>
        <div className="space-y-2">
          {SUPPLEMENTS_OPEN_OPTIONS.map((opt) => {
            const isSelected = supplementsOpen === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('supplementsOpen', opt.value, { shouldValidate: true })}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                <SealCheck
                  size={18}
                  weight="bold"
                  className="mt-0.5 shrink-0"
                  style={{ color: isSelected ? primaryColor : '#6B7280' }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.supplementsOpen && (
          <p className="text-xs text-red-500">{String(errors.supplementsOpen.message)}</p>
        )}
      </div>
    </div>
  );
}
