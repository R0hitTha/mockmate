import React from "react";
import { redirect } from "next/navigation";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { ProfileForm } from "@/components/profile/profile-form";

export const instant = false;

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const profile = await getStudentProfile(session.user.id);

  return (
    <ProfileForm
      initialUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: (session.user as { emailVerified?: boolean }).emailVerified,
      }}
      initialProfile={profile}
    />
  );
}
