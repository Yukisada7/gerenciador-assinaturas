-- Primeiro, vamos remover todas as políticas existentes
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Enable insert for authenticated users only" on profiles;
drop policy if exists "Service can create profiles" on profiles;

-- Agora vamos criar as políticas corretas
create policy "Enable read access for own profile"
    on profiles for select
    using ( auth.uid() = id );

create policy "Enable insert access for own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Enable update access for own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Garantir que RLS está habilitado
alter table profiles enable row level security; 