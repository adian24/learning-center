import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryShimmer() {
  return (
    <Skeleton className="flex gap-1 items-center animate-pulse">
      <span className="h-3 w-3 rounded-full bg-gray-300" />
      <span className="h-4 w-20 rounded bg-gray-300" />
    </Skeleton>
  );
}
