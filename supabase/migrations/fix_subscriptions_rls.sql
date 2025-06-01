-- Primeiro, remover todas as políticas existentes da tabela subscriptions
drop policy if exists "Users can view own subscriptions" on subscriptions;
drop policy if exists "Users can insert own subscriptions" on subscriptions;
drop policy if exists "Users can update own subscriptions" on subscriptions;
drop policy if exists "Users can delete own subscriptions" on subscriptions;

-- Garantir que RLS está habilitado
alter table subscriptions enable row level security;

-- Criar política para permitir que usuários vejam suas próprias assinaturas
create policy "Users can view own subscriptions"
  on subscriptions
  for select
  using (auth.uid() = user_id);

-- Criar política para permitir que usuários criem suas próprias assinaturas
create policy "Users can insert own subscriptions"
  on subscriptions
  for insert
  with check (auth.uid() = user_id);

-- Criar política para permitir que usuários atualizem suas próprias assinaturas
create policy "Users can update own subscriptions"
  on subscriptions
  for update
  using (auth.uid() = user_id);

-- Criar política para permitir que usuários deletem suas próprias assinaturas
create policy "Users can delete own subscriptions"
  on subscriptions
  for delete
  using (auth.uid() = user_id);

-- Garantir que a tabela está acessível para usuários autenticados
grant usage on schema public to authenticated;
grant all on subscriptions to authenticated; 