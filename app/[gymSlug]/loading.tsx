export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-gray-50">
      <div className="w-full max-w-[480px]">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Form skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          {/* Progress */}
          <div className="h-1.5 bg-gray-100 rounded-full animate-pulse" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Fields */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}

          {/* Navigation */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
