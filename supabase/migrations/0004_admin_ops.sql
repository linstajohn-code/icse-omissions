-- ============================================================
-- 0004_admin_ops.sql — Admin write policies + audit trigger
-- Run after 0001_init.sql
-- ============================================================

-- Admin DELETE on taxonomy + omissions (soft-delete is preferred but admin
-- can hard-delete from the DB; the app always soft-deletes via deleted_at)
create policy "admin delete chapters" on chapters
  for delete using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "admin delete topics" on topics
  for delete using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Audit trigger — fires on UPDATE / DELETE of omissions and topics
-- Captures full before/after diff in audit_log.diff_jsonb
-- ============================================================

create or replace function audit_changes()
returns trigger language plpgsql security definer as $$
declare
  _actor uuid;
  _diff  jsonb;
begin
  -- Try to get auth.uid(); falls back to NULL for service-role operations
  begin
    _actor := auth.uid();
  exception when others then
    _actor := null;
  end;

  if TG_OP = 'UPDATE' then
    -- Only record fields that actually changed
    select jsonb_object_agg(key, value)
    into _diff
    from (
      select key,
             jsonb_build_object('old', old_val, 'new', new_val) as value
      from (
        select key,
               (to_jsonb(OLD) -> key) as old_val,
               (to_jsonb(NEW) -> key) as new_val
        from jsonb_object_keys(to_jsonb(NEW)) as t(key)
        where (to_jsonb(OLD) -> key) is distinct from (to_jsonb(NEW) -> key)
          and key not in ('updated_at')
      ) changed
    ) diffs;

    insert into audit_log (actor_user_id, entity_table, entity_id, action, diff_jsonb)
    values (_actor, TG_TABLE_NAME, NEW.id, 'update', _diff);
    return NEW;

  elsif TG_OP = 'DELETE' then
    insert into audit_log (actor_user_id, entity_table, entity_id, action, diff_jsonb)
    values (_actor, TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD));
    return OLD;
  end if;

  return null;
end;
$$;

-- Attach to omissions and topics
create trigger omissions_audit
  after update or delete on omissions
  for each row execute function audit_changes();

create trigger topics_audit
  after update or delete on topics
  for each row execute function audit_changes();
