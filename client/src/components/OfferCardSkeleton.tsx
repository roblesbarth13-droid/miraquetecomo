import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OfferCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-md border border-border/50">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-2 space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-2 w-8" />
        </div>
        <Skeleton className="h-2 w-20" />
      </div>
    </Card>
  );
}
