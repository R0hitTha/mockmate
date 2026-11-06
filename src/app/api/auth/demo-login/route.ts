import { NextRequest, NextResponse } from "next/server";
import { DEMO_STUDENT_USER, DEMO_ADMIN_USER, saveDemoSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email || "student@mockmate.in";
    const isAdmin = body?.role === "ADMIN" || email.includes("admin");

    const user = isAdmin ? DEMO_ADMIN_USER : {
      ...DEMO_STUDENT_USER,
      name: body?.name || DEMO_STUDENT_USER.name,
      email: email || DEMO_STUDENT_USER.email,
    };

    const token = isAdmin ? "demo-admin-token" : "demo-student-token";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = {
      id: token,
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveDemoSession(token, { user, session });

    const response = NextResponse.json({
      success: true,
      user,
      session,
    });

    // Set Better Auth compatible session token cookie
    response.cookies.set("better-auth.session_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Set a client-readable role hint
    response.cookies.set("mockmate_role", user.role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[DEMO_LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create demo session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("better-auth.session_token", "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("mockmate_role", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

