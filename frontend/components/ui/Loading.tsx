export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#68717f]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#8b9cff]" />
      {label}
    </div>
  );
}
