-- Let members remove picks they added themselves.

create policy "members can delete own picks" on public.picks
  for delete using (added_by = auth.uid());
