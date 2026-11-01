import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function AdminPlaceholderPage() {
  // Server-side authorization check: Asserts role === "ADMIN"
  await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-background py-16">
      <Container size="sm">
        <Card className="border-border">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              MockMate Administrative Area
            </h1>
            <p className="text-xs text-muted-foreground">
              Restricted to authorized system administrators. Administrative panel
              functionality will be implemented in future phases.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Return to Student Dashboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
