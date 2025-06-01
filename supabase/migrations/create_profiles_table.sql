-- Adicionar política para permitir que usuários criem seus próprios perfis
create policy "Users can insert own profile" on profiles
    for insert with check (auth.uid() = id);

-- Adicionar política para permitir que o serviço de autenticação crie perfis
create policy "Service can create profiles" on profiles
    for insert
    with check (true);  -- Permite que o serviço de autenticação crie perfis 