create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  service_name text not null,
  monthly_cost decimal(10,2) not null,
  billing_day integer not null check (billing_day between 1 and 31),
  category text not null,
  next_billing_date timestamp with time zone not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Criar política RLS para permitir que usuários vejam apenas suas próprias assinaturas
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Criar política RLS para permitir que usuários criem suas próprias assinaturas
create policy "Users can create own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

-- Criar política RLS para permitir que usuários atualizem suas próprias assinaturas
create policy "Users can update own subscriptions"
  on subscriptions for update
  using (auth.uid() = user_id);

-- Criar política RLS para permitir que usuários deletem suas próprias assinaturas
create policy "Users can delete own subscriptions"
  on subscriptions for delete
  using (auth.uid() = user_id);

-- Habilitar RLS
alter table subscriptions enable row level security; 