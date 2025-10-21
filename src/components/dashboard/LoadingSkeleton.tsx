import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const MapViewSkeleton = () => (
  <div className="w-full h-full p-4 space-y-4">
    <Skeleton className="w-full h-full rounded-xl" />
  </div>
);

export const ListViewSkeleton = () => (
  <div className="w-full h-full p-4 space-y-3">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="glass-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const DashboardHeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-32 h-6" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="w-24 h-8" />
      <Skeleton className="w-24 h-8" />
    </div>
  </div>
);
