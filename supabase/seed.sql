-- Seed bootstrap profiles (passwordless login directory)
-- Full domain seed is loaded by the app local store or migrated via scripts/seed-from-demo.ts

insert into profiles (id, email, name, role, region, active) values
  ('00000000-0000-4000-8000-000000000001', 'superadmin@ugsot.edu', 'Super Admin', 'super_admin', 'NCR', true),
  ('00000000-0000-4000-8000-000000000002', 'admin@ugsot.edu', 'Portal Admin', 'admin', 'NCR', true),
  ('00000000-0000-4000-8000-000000000003', 'ops@ugsot.edu', 'Ops Lead', 'operations', 'NCR', true),
  ('00000000-0000-4000-8000-000000000004', 'leadership@ugsot.edu', 'Leadership', 'leadership', 'NCR', true),
  ('00000000-0000-4000-8000-000000000005', 'b2b.member@ugsot.edu', 'B2B Member', 'b2b_member', 'NCR', true),
  ('00000000-0000-4000-8000-000000000006', 'b2b.lead@ugsot.edu', 'B2B Lead', 'b2b_lead', 'NCR', true)
on conflict (email) do nothing;

insert into app_settings (key, value) values
  ('legacy_portal_utm_url', 'https://admin.example.com/utm/create'),
  ('legacy_portal_coupon_url', 'https://admin.example.com/coupon/create'),
  ('org_name', 'upGrad School of Technology')
on conflict (key) do nothing;
