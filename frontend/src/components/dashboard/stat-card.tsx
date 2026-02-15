"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  description?: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  className,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className={cn("gap-4 border-l-4 border-l-primary", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</CardTitle>
        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
          {icon}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="font-mono-data text-2xl font-semibold tracking-tight">{value}</p>
        )}

        {description ? (
          isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-muted-foreground text-xs">{description}</p>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
