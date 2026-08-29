-- Extend "delete own picks" to also cover legacy/imported picks that were
-- attributed by name only (no linked profile) but match the deleter's name.

drop policy "members can delete own picks" on public.picks;

create policy "members can delete own picks" on public.picks
  for delete using (
    added_by = auth.uid()
    or (
      added_by is null
      and added_by_name = (select display_name from public.profiles where id = auth.uid())
    )
  );
