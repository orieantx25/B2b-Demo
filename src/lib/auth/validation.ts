import { z } from "zod";
import type { AppRole } from "@/lib/auth/roles";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const profileSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
  role: z.enum([
    "super_admin",
    "admin",
    "b2b_member",
    "b2b_lead",
    "operations",
    "leadership",
  ] as [AppRole, ...AppRole[]]),
  region: z.string().trim().min(1),
  active: z.boolean().optional(),
  id: z.string().optional(),
});

export const settingsSchema = z.object({
  legacy_portal_utm_url: z.string().url().optional(),
  legacy_portal_coupon_url: z.string().url().optional(),
  org_name: z.string().min(1).optional(),
});
