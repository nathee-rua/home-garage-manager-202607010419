import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RootLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded bg-muted" />
      </div>

      {/* Config Banner Skeleton */}
      <div className="h-10 w-full animate-pulse rounded bg-muted/60" />

      {/* Grid of 4 Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Large Table Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-muted/40" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
