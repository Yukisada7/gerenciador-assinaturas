-- Primeiro, remover o trigger existente
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recriar a função com permissões corretas
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now());
  return new;
end;
$$;

-- Recriar o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garantir que o RLS não impede a função de criar perfis
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.profiles to postgres, anon, authenticated, service_role;

-- Adicionar política específica para permitir a criação de perfis pelo trigger
create policy "Allow trigger to create profiles"
  on profiles for insert
  to postgres, service_role
  with check (true); 