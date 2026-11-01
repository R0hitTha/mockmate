import { NextResponse } from "next/server";
import { connection } from "next/server";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";
import type { HealthCheckResponse } from "@/types";

export async function GET() {
  await connection();

  let dbStatus: "connected" | "pending_configuration" | "error" = "pending_configuration";

  const databaseUrl = process.env.DATABASE_URL;

  if (
    databaseUrl &&
    !databaseUrl.includes("randompassword") &&
    !databaseUrl.includes("mockmate_password")
  ) {
    try {
      // Test lightweight connectivity
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }
  } else {
    // Default placeholder indicates credentials are not yet configured
    dbStatus = "pending_configuration";
  }

  const payload: HealthCheckResponse = {
    status: dbStatus === "error" ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    database: dbStatus,
  };

  return NextResponse.json({
    app: siteConfig.name,
    tagline: siteConfig.tagline,
    currentPhase: siteConfig.currentPhase,
    targetExams: siteConfig.targetExams,
    ...payload,
  });
}
