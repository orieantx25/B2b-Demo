-- Storage buckets for photos / cards / docs
-- Run in Supabase SQL editor or via storage API after project create

insert into storage.buckets (id, name, public)
values
  ('meeting-photos', 'meeting-photos', true),
  ('visiting-cards', 'visiting-cards', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- Public read for meeting photos & visiting cards
create policy "Public read meeting-photos"
  on storage.objects for select
  using (bucket_id = 'meeting-photos');

create policy "Public read visiting-cards"
  on storage.objects for select
  using (bucket_id = 'visiting-cards');

create policy "Authenticated upload meeting-photos"
  on storage.objects for insert
  with check (bucket_id = 'meeting-photos');

create policy "Authenticated upload visiting-cards"
  on storage.objects for insert
  with check (bucket_id = 'visiting-cards');

create policy "Authenticated upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents');
