import React from "react";
import { redirect } from "next/navigation";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const instant = false;

export default async function OnboardingPage() {
  const session = await getServerSession();

  // Route protection: Must be authenticated to access onboarding
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const profile = await getStudentProfile(session.user.id);

  // Completed onboarding redirects students away from onboarding to dashboard
  if (profile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      initialName={session.user.name || ""}
      initialPhone={profile?.normalizedPhone || ""}
      initialStep={profile?.currentStep || 1}
    />
  );
}
