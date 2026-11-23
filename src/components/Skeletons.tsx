interface SkeletonsProps {
  count?: number;
}

export function BookCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative aspect-[3/4] skeleton" />
      <div className="flex flex-1 flex-col p-3">
        <div className="h-4 w-full skeleton mb-2" />
        <div className="h-3 w-2/3 skeleton mb-2" />
        <div className="h-3 w-1/3 skeleton" />
        <div className="mt-auto pt-3">
          <div className="h-5 w-1/2 skeleton mb-2" />
          <div className="h-8 w-full skeleton" />
        </div>
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: SkeletonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BookListSkeleton({ count = 4 }: SkeletonsProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex gap-4 p-4">
          <div className="h-32 w-24 shrink-0 skeleton rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 skeleton" />
            <div className="h-3 w-1/2 skeleton" />
            <div className="h-3 w-full skeleton" />
            <div className="h-3 w-2/3 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return <div className="card h-32 skeleton" />;
}
