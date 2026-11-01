import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { getAdminResults } from "@/lib/evaluation-service";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { AdminResultsTable } from "@/components/admin/results/admin-results-table";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Results Management — MockMate",
  description: "Administrative audit and re-evaluation control for student test attempts.",
};

export default async function AdminResultsPage() {
  // Enforce ADMIN role
  await requireRole("ADMIN");

  const { results, total } = await getAdminResults({
    page: 1,
    limit: 100,
    sortBy: "date",
    sortOrder: "desc",
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <Container size="default">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Back to Admin Overview</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                <span>Student Dashboard</span>
              </Button>
            </Link>
          </div>

          <AdminResultsTable
            initialResults={results}
            totalResults={total}
          />
        </div>
      </Container>
    </div>
  );
}
