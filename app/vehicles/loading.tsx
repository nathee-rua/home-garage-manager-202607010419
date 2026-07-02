import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function VehiclesLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-60 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded bg-muted" />
      </div>

      {/* Vehicles Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded bg-muted" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-0">
              <div className="flex items-center justify-between border-t py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-3">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
