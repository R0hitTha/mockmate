import React from "react";
import Link from "next/link";
import { AlertCircle, FileCheck2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export function MistakeEmptyState() {
  return (
    <Card className="border border-border">
      <CardContent className="p-8 sm:p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Zero Mistake Records Identified</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
          You haven&apos;t generated any evaluated errors or skipped questions yet. Complete a full CUET mock examination or subject practice drill to populate your mistake intelligence notebook.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 w-full sm:w-auto h-9 text-xs font-semibold">
            <Link href="/mock-tests">
              <FileCheck2 className="w-4 h-4" />
              <span>Explore Mock Tests</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

