-- Criar função que será chamada pelo trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now());
  return new;
end;
$$;

-- Criar trigger na tabela auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user(); 