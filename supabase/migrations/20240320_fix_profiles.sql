-- Primeiro, vamos dropar as políticas existentes
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Service can create profiles" on profiles;

-- Agora vamos recriar a tabela com a estrutura correta
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    full_name text,
    phone_number text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table profiles enable row level security;

-- Criar políticas de acesso
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on profiles for insert
    with check (auth.uid() = id);

create policy "Enable insert for authenticated users only"
    on profiles for insert
    with check (auth.role() = 'authenticated');

-- Criar função para atualizar o updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Criar trigger para atualizar o updated_at
drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at
    before update on profiles
    for each row
    execute function handle_updated_at(); 