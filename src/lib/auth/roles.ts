export type AppRole =
  | "super_admin"
  | "admin"
  | "b2b_member"
  | "b2b_lead"
  | "operations"
  | "leadership";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  region: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: AppRole;
  region: string;
}

export type Workspace = "b2b" | "operations" | "reports" | "admin";

export function roleToWorkspace(role: AppRole): Workspace {
  switch (role) {
    case "operations":
      return "operations";
    case "leadership":
      return "reports";
    case "super_admin":
    case "admin":
      return "admin";
    default:
      return "b2b";
  }
}

export function roleHomePath(role: AppRole): string {
  switch (role) {
    case "operations":
      return "/operations";
    case "leadership":
      return "/reports";
    case "super_admin":
    case "admin":
      return "/admin";
    default:
      return "/b2b";
  }
}

/** Which workspaces a role may enter */
export function allowedWorkspaces(role: AppRole): Workspace[] {
  switch (role) {
    case "super_admin":
    case "admin":
      return ["b2b", "operations", "reports", "admin"];
    case "operations":
      return ["operations"];
    case "leadership":
      return ["reports"];
    case "b2b_lead":
    case "b2b_member":
      return ["b2b"];
    default:
      return ["b2b"];
  }
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith("/access-denied") || pathname.startsWith("/session-expired")) {
    return true;
  }
  if (pathname.startsWith("/admin")) {
    return role === "super_admin" || role === "admin";
  }
  if (pathname.startsWith("/operations")) {
    return ["super_admin", "admin", "operations"].includes(role);
  }
  if (pathname.startsWith("/reports")) {
    return ["super_admin", "admin", "leadership"].includes(role);
  }
  if (pathname.startsWith("/b2b") || pathname.startsWith("/consultants")) {
    return ["super_admin", "admin", "b2b_member", "b2b_lead"].includes(role);
  }
  return true;
}

export function legacyMemberRole(role: AppRole): "B2B Member" | "B2B Lead" | "Operations" | "Admin" | "Leadership" {
  switch (role) {
    case "b2b_lead":
      return "B2B Lead";
    case "operations":
      return "Operations";
    case "super_admin":
    case "admin":
      return "Admin";
    case "leadership":
      return "Leadership";
    default:
      return "B2B Member";
  }
}

export function fromLegacyRole(
  role: "B2B Member" | "B2B Lead" | "Operations" | "Admin" | "Leadership"
): AppRole {
  switch (role) {
    case "B2B Lead":
      return "b2b_lead";
    case "Operations":
      return "operations";
    case "Admin":
      return "admin";
    case "Leadership":
      return "leadership";
    default:
      return "b2b_member";
  }
}

export const ACCESS_MATRIX: {
  role: AppRole;
  label: string;
  workspaces: string[];
  capabilities: string[];
}[] = [
  {
    role: "super_admin",
    label: "Super Admin",
    workspaces: ["Admin", "B2B", "Operations", "Reports"],
    capabilities: ["Manage users & roles", "All domain actions", "Settings", "Audit"],
  },
  {
    role: "admin",
    label: "Admin",
    workspaces: ["Admin", "B2B", "Operations", "Reports"],
    capabilities: ["Manage users", "Ownership transfer", "All queues"],
  },
  {
    role: "b2b_member",
    label: "B2B Member",
    workspaces: ["B2B"],
    capabilities: ["Own consultants", "Schedule meetings", "Request MOU", "Upload docs"],
  },
  {
    role: "b2b_lead",
    label: "B2B Lead",
    workspaces: ["B2B"],
    capabilities: ["Team view", "Same as B2B Member"],
  },
  {
    role: "operations",
    label: "Operations",
    workspaces: ["Operations"],
    capabilities: ["Verify MOU", "Rework", "WO", "Exceptions"],
  },
  {
    role: "leadership",
    label: "Leadership",
    workspaces: ["Reports"],
    capabilities: ["Executive KPIs", "Weekly review"],
  },
];
