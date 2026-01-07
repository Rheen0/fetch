import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MatchCardSkeleton() {
  return (
    <Card className="w-[280px] shrink-0 overflow-hidden border-gray-200">
      <CardContent className="p-0">
        <Skeleton className="w-full h-[200px]" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchCardListSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {[...Array(3)].map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}
