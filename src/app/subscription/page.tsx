import React from "react";
import { redirect } from "next/navigation";
import { StudentLayout } from "@/components/layout/student-layout";
import { SubscriptionClientView } from "./subscription-client-view";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import {
  getStudentActiveSubscription,
  getSubscriptionPlans,
} from "@/lib/entitlement-service";

export const instant = false;

export default async function StudentSubscriptionPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/subscription");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const [currentSubscription, availablePlans] = await Promise.all([
    getStudentActiveSubscription(session.user.id),
    getSubscriptionPlans(false),
  ]);

  return (
    <StudentLayout
      activeRoute="/subscription"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "My Plan & Entitlements" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <SubscriptionClientView
        currentSubscription={currentSubscription}
        availablePlans={availablePlans}
        studentName={session.user.name || "Student Aspirant"}
      />
    </StudentLayout>
  );
}
