// Reusable skeleton loaders for loading states across hub pages

export function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />;
}

export function SkeletonText({ lines = 2, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-lg animate-pulse h-3"
          style={{ width: i === lines - 1 && lines > 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-9 h-9 rounded-xl flex-shrink-0" />
        <SkeletonBlock className="h-4 flex-1 rounded-lg" />
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonHero({ className = '' }) {
  return (
    <div className={`rounded-2xl overflow-hidden bg-gray-200 animate-pulse ${className}`} style={{ height: 100 }} />
  );
}

export function SkeletonGrid({ cols = 2, count = 4, className = '' }) {
  return (
    <div className={`grid gap-3 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

// Full hub page skeleton — hero + 4 cards
export function HubSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <SkeletonHero />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-20 rounded-xl" />)}
      </div>
      <SkeletonCard />
      <SkeletonGrid cols={2} count={4} />
    </div>
  );
}
