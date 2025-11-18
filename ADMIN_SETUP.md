# Como Tornar um Usuário Admin

Para dar permissões de administrador a um usuário, você precisa adicionar uma entrada na tabela `user_roles` no banco de dados.

## Passos:

1. **Acesse o Backend do Lovable Cloud:**
   - Clique em "View Backend" no painel do Lovable
   - Navegue até a seção "Database" → "Tables"

2. **Crie sua conta primeiro:**
   - Acesse `/auth` no seu app
   - Crie uma conta com seu email

3. **Adicione o role de admin:**
   - No backend, vá para a tabela `user_roles`
   - Clique em "Insert" para adicionar uma nova linha
   - Preencha os campos:
     - `user_id`: Cole o UUID do seu usuário (encontre na tabela `profiles`)
     - `role`: Selecione `admin`
   - Salve a entrada

## Usando SQL Diretamente:

Se preferir, você pode executar este SQL no Lovable Cloud:

\`\`\`sql
-- Substitua 'seu@email.com' pelo seu email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'seu@email.com';
\`\`\`

Depois de adicionar o role de admin, faça logout e login novamente para que as permissões sejam aplicadas.

## Verificação:

Após se tornar admin, você verá:
- Botão "Admin" no cabeçalho do site
- Acesso à página `/admin` com todas as imagens subidas
- Capacidade de deletar imagens
