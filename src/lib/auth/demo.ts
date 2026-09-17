/** Shared demo-auth constants — production password login is PRD-only. */

export const DEMO_AUTH_DISABLED = true;

export const DEMO_USER = {
  id: "USR-SUPERADMIN",
  email: "superadmin@ugsot.edu",
  name: "Super Admin",
  role: "super_admin" as const,
  region: "NCR",
};
