import { StudentLayout } from "@/components/layouts/student-layout";
import { PageHeader } from "@/components/layouts/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function MatchesLoading() {
  return (
    <StudentLayout currentPath="dashboard">
      <PageHeader
        title="Your Matches"
        subtitle="Loading your matches..."
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <Card key={j} className="overflow-hidden border-gray-200">
                      <CardContent className="p-0">
                        <Skeleton className="w-full h-[200px]" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-10 w-full mt-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
