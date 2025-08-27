-- Ensure WITH CHECK for INSERT/UPDATE policies

drop policy if exists boards_owner on boards;
create policy boards_owner on boards for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists entries_board_owner on entries;
create policy entries_board_owner on entries for all
  using (exists (select 1 from boards b where b.id = board_id and b.user_id = auth.uid()))
  with check (exists (select 1 from boards b where b.id = board_id and b.user_id = auth.uid()));

drop policy if exists subs_owner on subscriptions;
create policy subs_owner on subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


