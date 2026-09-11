import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase/server";
import type { Profile, AppRole } from "@/lib/auth/roles";
import * as local from "@/lib/db/local";

function mapRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role as AppRole,
    region: String(row.region),
    active: Boolean(row.active),
    createdAt: String(row.created_at || row.createdAt),
    updatedAt: String(row.updated_at || row.updatedAt),
  };
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return local.findProfileByEmail(email) || null;
  }
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return local.findProfileById(id) || null;
  }
  const sb = createServiceClient();
  const { data, error } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function listAllProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return local.listProfiles();
  }
  const sb = createServiceClient();
  const { data, error } = await sb.from("profiles").select("*").order("name");
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function createOrUpdateProfile(input: {
  id?: string;
  email: string;
  name: string;
  role: AppRole;
  region: string;
  active?: boolean;
}): Promise<Profile> {
  if (!isSupabaseConfigured()) {
    return local.upsertProfile(input);
  }
  const sb = createServiceClient();
  const payload = {
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    region: input.region,
    active: input.active ?? true,
    updated_at: new Date().toISOString(),
  };
  if (input.id) {
    const { data, error } = await sb.from("profiles").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return mapRow(data);
  }
  const { data, error } = await sb.from("profiles").insert(payload).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function setActive(id: string, active: boolean): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return local.setProfileActive(id, active);
  }
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("profiles")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function readSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) {
    return local.getSettings();
  }
  const sb = createServiceClient();
  const { data } = await sb.from("app_settings").select("key, value");
  const map: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => {
    map[r.key] = r.value;
  });
  return map;
}

export async function writeSetting(key: string, value: string) {
  if (!isSupabaseConfigured()) {
    local.setSetting(key, value);
    return;
  }
  const sb = createServiceClient();
  await sb.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
}
