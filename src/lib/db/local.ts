import { generateSeedData } from "@/data/seed";
import type { Profile, AppRole } from "@/lib/auth/roles";
import { fromLegacyRole } from "@/lib/auth/roles";

export type AppSettingsMap = Record<string, string>;

type DomainSeed = ReturnType<typeof generateSeedData>;

export interface ServerDb {
  profiles: Profile[];
  settings: AppSettingsMap;
  domain: DomainSeed;
}

declare global {
  var __ugsotServerDb: ServerDb | undefined;
}

function emailFromName(name: string, role: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
  const domain =
    role === "Operations"
      ? "ops.ugsot.edu"
      : role === "Leadership"
        ? "lead.ugsot.edu"
        : role === "Admin"
          ? "admin.ugsot.edu"
          : "b2b.ugsot.edu";
  return `${slug}@${domain}`;
}

function buildProfilesFromSeed(domain: DomainSeed): Profile[] {
  const now = new Date().toISOString();
  const fromMembers: Profile[] = domain.members.map((m) => ({
    id: m.id,
    email: m.email || emailFromName(m.name, m.role),
    name: m.name,
    role: fromLegacyRole(m.role),
    region: m.region,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));

  const extras: Profile[] = [
    {
      id: "profile-super-admin",
      email: "superadmin@ugsot.edu",
      name: "Super Admin",
      role: "super_admin",
      region: "NCR",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Ensure seeded members have usable emails for login
  const withEmails = fromMembers.map((p) => ({
    ...p,
    email: p.email.includes("@") ? p.email.toLowerCase() : emailFromName(p.name, p.role),
  }));

  const byEmail = new Map<string, Profile>();
  [...extras, ...withEmails].forEach((p) => {
    byEmail.set(p.email.toLowerCase(), p);
  });
  return Array.from(byEmail.values());
}

function createDb(): ServerDb {
  const seed = generateSeedData();
  // Patch member emails for login
  const members = seed.members.map((m) => ({
    ...m,
    email: (m.email || emailFromName(m.name, m.role)).toLowerCase(),
  }));
  const domain = { ...seed, members };
  return {
    profiles: buildProfilesFromSeed(domain),
    settings: {
      legacy_portal_utm_url: "https://admin.example.com/utm/create",
      legacy_portal_coupon_url: "https://admin.example.com/coupon/create",
      org_name: "upGrad School of Technology",
    },
    domain,
  };
}

export function getServerDb(): ServerDb {
  if (!globalThis.__ugsotServerDb) {
    globalThis.__ugsotServerDb = createDb();
  }
  return globalThis.__ugsotServerDb;
}

export function findProfileByEmail(email: string): Profile | undefined {
  const db = getServerDb();
  return db.profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
}

export function findProfileById(id: string): Profile | undefined {
  return getServerDb().profiles.find((p) => p.id === id);
}

export function listProfiles(): Profile[] {
  return [...getServerDb().profiles].sort((a, b) => a.name.localeCompare(b.name));
}

export function upsertProfile(input: {
  id?: string;
  email: string;
  name: string;
  role: AppRole;
  region: string;
  active?: boolean;
}): Profile {
  const db = getServerDb();
  const now = new Date().toISOString();
  const existing = input.id
    ? db.profiles.find((p) => p.id === input.id)
    : db.profiles.find((p) => p.email.toLowerCase() === input.email.toLowerCase());

  if (existing) {
    existing.email = input.email.toLowerCase();
    existing.name = input.name;
    existing.role = input.role;
    existing.region = input.region;
    if (typeof input.active === "boolean") existing.active = input.active;
    existing.updatedAt = now;
    // Keep domain members in sync for Zustand-compatible IDs
    const member = db.domain.members.find((m) => m.id === existing.id);
    if (member) {
      member.name = existing.name;
      member.email = existing.email;
      member.region = existing.region;
      member.role =
        existing.role === "b2b_lead"
          ? "B2B Lead"
          : existing.role === "operations"
            ? "Operations"
            : existing.role === "leadership"
              ? "Leadership"
              : existing.role === "admin" || existing.role === "super_admin"
                ? "Admin"
                : "B2B Member";
    }
    return existing;
  }

  const profile: Profile = {
    id: input.id || `profile-${Date.now()}`,
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    region: input.region,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  db.profiles.unshift(profile);
  db.domain.members.unshift({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    region: profile.region,
    role:
      profile.role === "b2b_lead"
        ? "B2B Lead"
        : profile.role === "operations"
          ? "Operations"
          : profile.role === "leadership"
            ? "Leadership"
            : profile.role === "admin" || profile.role === "super_admin"
              ? "Admin"
              : "B2B Member",
  });
  return profile;
}

export function setProfileActive(id: string, active: boolean): Profile | null {
  const p = findProfileById(id);
  if (!p) return null;
  p.active = active;
  p.updatedAt = new Date().toISOString();
  return p;
}

export function getSettings(): AppSettingsMap {
  return { ...getServerDb().settings };
}

export function setSetting(key: string, value: string) {
  getServerDb().settings[key] = value;
}
