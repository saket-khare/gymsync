'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GENDERS, STEP_META, LEAD_SOURCE_OPTIONS } from '@/lib/onboarding-steps';

interface Step1PersonalProps {
  primaryColor?: string;
}

export default function Step1Personal({ primaryColor = '#1A56DB' }: Step1PersonalProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedGender = watch('gender');
  const selectedLeadSource = watch('leadSource');

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{STEP_META[0].title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{STEP_META[0].subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First Name
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Rahul"
            className={cn(errors.firstName && 'border-red-400')}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{String(errors.firstName.message)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last Name
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Sharma"
            className={cn(errors.lastName && 'border-red-400')}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{String(errors.lastName.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="rahul@example.com"
          className={cn(errors.email && 'border-red-400')}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{String(errors.email.message)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+91 98765 43210"
          className={cn(errors.phone && 'border-red-400')}
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{String(errors.phone.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age" className="text-sm font-medium text-gray-700">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            {...register('age')}
            placeholder="25"
            min={13}
            max={100}
            className={cn(errors.age && 'border-red-400')}
          />
          {errors.age && (
            <p className="text-xs text-red-500">{String(errors.age.message)}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Mumbai"
            className={cn(errors.city && 'border-red-400')}
          />
          {errors.city && (
            <p className="text-xs text-red-500">{String(errors.city.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Gender</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setValue('gender', g.value, { shouldValidate: true })}
              className={cn(
                'p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left',
                selectedGender === g.value
                  ? 'border-current text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300',
              )}
              style={
                selectedGender === g.value
                  ? { borderColor: primaryColor, backgroundColor: primaryColor }
                  : {}
              }
            >
              {g.label}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-xs text-red-500">{String(errors.gender.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          How did you hear about us?
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEAD_SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('leadSource', opt.value, { shouldValidate: true })}
              className={cn(
                'p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left',
                selectedLeadSource === opt.value
                  ? 'border-current text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300',
              )}
              style={
                selectedLeadSource === opt.value
                  ? { borderColor: primaryColor, backgroundColor: primaryColor }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
