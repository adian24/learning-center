"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgramDetailShimmer() {
  return (
    <section className="bg-white px-6 animate-pulse">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 shadow-sm border border-sky-200">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Skeleton className="w-[320px] h-[180px] rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-2/3 rounded bg-gray-200" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                  <Skeleton className="h-4 w-1/3 bg-gray-200" />
                  <Skeleton className="h-4 w-1/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/3 bg-gray-200" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border border-sky-200">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3 bg-gray-200" />
              <Skeleton className="h-24 w-full bg-gray-100" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-sky-200">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/2 bg-gray-200" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-gray-200" />
                    <Skeleton className="h-4 w-2/3 bg-gray-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border border-sky-200">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3 bg-gray-200" />
              <Skeleton className="h-4 w-1/2 bg-gray-100" />
              <Skeleton className="h-4 w-1/3 bg-gray-100" />
              <Skeleton className="h-4 w-1/4 bg-gray-100" />
              <Skeleton className="h-10 w-full rounded-xl bg-sky-200" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
