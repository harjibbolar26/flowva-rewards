/* Create a function to check if an email exists in auth.users */
create or replace function public.check_email_exists(user_email text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from auth.users
    where email = user_email
  );
end;
$$;
