/**
 * Client-safe role hierarchy and permission checking functions for MockMate.
 * Zero database/node imports so this can be imported in client components safely.
 */

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageContent(role?: string | null): boolean {
  return isSuperAdmin(role) || role === "CONTENT_ADMIN";
}

export function canManageSupport(role?: string | null): boolean {
  return isSuperAdmin(role) || role === "SUPPORT_ADMIN";
}

export function canManageFinance(role?: string | null): boolean {
  return isSuperAdmin(role) || role === "FINANCE_ADMIN";
}

export function checkAdminAccess(
  userRole?: string | null,
  requiredDomain: "ALL" | "CONTENT" | "SUPPORT" | "FINANCE" = "ALL"
): boolean {
  if (!userRole) return false;
  if (isSuperAdmin(userRole)) return true;

  switch (requiredDomain) {
    case "CONTENT":
      return userRole === "CONTENT_ADMIN";
    case "SUPPORT":
      return userRole === "SUPPORT_ADMIN";
    case "FINANCE":
      return userRole === "FINANCE_ADMIN";
    case "ALL":
    default:
      return isSuperAdmin(userRole);
  }
}

