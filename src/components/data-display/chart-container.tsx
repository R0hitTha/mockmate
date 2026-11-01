import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/layout/card";
import { Skeleton } from "@/components/feedback/skeleton";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  height?: string | number;
}

export function ChartContainer({
  title,
  description,
  actions,
  children,
  isLoading = false,
  className,
  height = 300,
}: ChartContainerProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="w-full flex items-center justify-center" style={{ height }}>
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : (
          <div style={{ height }} className="w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
