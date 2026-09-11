-- uGSOT B2B Operations Portal — initial schema
-- Apply with: supabase db push / supabase migration up

create extension if not exists "pgcrypto";

-- Roles
create type app_role as enum (
  'super_admin',
  'admin',
  'b2b_member',
  'b2b_lead',
  'operations',
  'leadership'
);

create type meeting_type as enum ('In Person', 'Online');
create type meeting_status as enum ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled');
create type consultant_status as enum ('Pending', 'MOU Signed', 'UTM Ready', 'Active', 'Inactive');
create type mou_status as enum (
  'Requested', 'Verification', 'Rework', 'Approved', 'WO Generated',
  'WO Sent', 'Awaiting Signature', 'Signed', 'Legal Review', 'Finance Approval'
);
create type commercial_type as enum ('Standard', 'Non-Standard');
create type doc_type as enum (
  'PAN', 'GST', 'Bank Details', 'Authorized Signatory', 'Other', 'Visiting Card', 'Signed WO'
);
create type doc_status as enum ('Missing', 'Uploaded', 'Verified', 'Needs Review');
create type verification_flag as enum ('Match', 'Missing', 'Needs Review');
create type merge_status as enum ('Pending', 'Approved', 'Rejected');
create type coupon_status as enum ('Active', 'Inactive', 'Expired');
create type utm_status as enum ('Requested', 'Created', 'Mapped', 'Inactive');
create type weekly_report_status as enum ('Draft', 'Ready', 'Reviewed');

-- Profiles (auth directory — passwordless email login)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role app_role not null default 'b2b_member',
  region text not null default 'NCR',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on profiles (lower(email));
create index profiles_role_idx on profiles (role);

create table app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

create table consultants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text not null,
  phone text not null,
  email text not null,
  owner_id uuid not null references profiles(id),
  region text not null,
  consultant_code text not null unique,
  existing_utm_code text,
  designation text,
  status consultant_status not null default 'Pending',
  mou_status text not null default 'None',
  utm_status text not null default 'None',
  first_meeting_id uuid,
  first_meeting_date timestamptz,
  first_lead_id uuid,
  first_lead_date timestamptz,
  leads_count int not null default 0,
  test_takers_count int not null default 0,
  admissions_count int not null default 0,
  incomplete_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index consultants_owner_idx on consultants (owner_id);
create index consultants_code_idx on consultants (consultant_code);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid references consultants(id),
  consultant_name text not null,
  date date not null,
  time text not null,
  type meeting_type not null,
  status meeting_status not null default 'Scheduled',
  owner_id uuid not null references profiles(id),
  phone text,
  email text,
  location text,
  notes text,
  photo_url text,
  geo jsonb,
  organization text,
  created_at timestamptz not null default now()
);

create index meetings_owner_idx on meetings (owner_id);
create index meetings_consultant_idx on meetings (consultant_id);

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  location text not null,
  notes text,
  owner_id uuid not null references profiles(id),
  photos text[],
  created_at timestamptz not null default now()
);

create table ownership_records (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  owner_id uuid not null references profiles(id),
  owner_name text not null,
  from_date timestamptz not null,
  to_date timestamptz,
  reason text,
  comments text
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  mou_id uuid,
  type doc_type not null,
  name text not null,
  status doc_status not null default 'Uploaded',
  uploaded_at timestamptz,
  verification verification_flag,
  storage_path text
);

create table mous (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  meeting_id uuid not null references meetings(id),
  requested_by uuid not null references profiles(id),
  status mou_status not null default 'Requested',
  commercial_type commercial_type not null,
  slab text,
  payment_terms text,
  wo_number text,
  legal_status text not null default 'Not Started',
  finance_status text not null default 'Not Started',
  rework_items text[],
  rework_message text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  approved_at timestamptz,
  wo_generated_at timestamptz,
  wo_sent_at timestamptz,
  signed_at timestamptz,
  sla_due_at timestamptz not null
);

create index mous_status_idx on mous (status);
create index mous_consultant_idx on mous (consultant_id);

create table utms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  consultant_id uuid not null references consultants(id),
  counsellor_code text,
  parent_utm_id uuid references utms(id),
  status utm_status not null default 'Mapped',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  source text not null default 'Existing UTM System'
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  consultant_id uuid not null references consultants(id),
  created_by uuid not null references profiles(id),
  created_for text not null,
  created_at timestamptz not null default now(),
  status coupon_status not null default 'Active'
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  utm_id uuid references utms(id),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  source text not null default 'Existing Lead System'
);

create table test_takers (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  lead_id uuid not null references leads(id),
  name text not null,
  exam_date date not null,
  source text not null default 'Existing Exam System'
);

create table admissions (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  lead_id uuid not null references leads(id),
  name text not null,
  admitted_at timestamptz not null,
  source text not null default 'Existing Admission System'
);

create table merge_requests (
  id uuid primary key default gen_random_uuid(),
  primary_id uuid not null references consultants(id),
  duplicate_id uuid not null references consultants(id),
  requested_by uuid not null references profiles(id),
  status merge_status not null default 'Pending',
  reason text not null,
  created_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid references consultants(id),
  type text not null,
  title text not null,
  description text not null,
  actor_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index activities_created_idx on activities (created_at desc);

create table weekly_reports (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  status weekly_report_status not null default 'Ready',
  meetings int not null default 0,
  new_consultants int not null default 0,
  mou_requests int not null default 0,
  mou_signed int not null default 0,
  active_consultants int not null default 0,
  leads int not null default 0,
  test_takers int not null default 0,
  admissions int not null default 0,
  exceptions jsonb not null default '{}',
  notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Storage buckets (run via dashboard or storage API)
-- meeting-photos, visiting-cards, documents

-- Default settings
insert into app_settings (key, value) values
  ('legacy_portal_utm_url', 'https://admin.example.com/utm/create'),
  ('legacy_portal_coupon_url', 'https://admin.example.com/coupon/create'),
  ('org_name', 'upGrad School of Technology');

-- RLS (defense in depth — app also uses service role + server checks)
alter table profiles enable row level security;
alter table consultants enable row level security;
alter table meetings enable row level security;
alter table mous enable row level security;
alter table documents enable row level security;
alter table utms enable row level security;
alter table coupons enable row level security;
alter table activities enable row level security;
alter table app_settings enable row level security;

-- Service role bypasses RLS; policies for authenticated JWT claims if used later
create policy "profiles_read_self_or_admin" on profiles for select using (true);
create policy "consultants_read" on consultants for select using (true);
create policy "meetings_read" on meetings for select using (true);
create policy "mous_read" on mous for select using (true);
