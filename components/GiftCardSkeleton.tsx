export default function GiftCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-44 bg-muted/50" />
      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-6 w-24 rounded bg-muted mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 flex-1 rounded-lg bg-muted" />
          <div className="h-7 w-20 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}