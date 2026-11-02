# Podshop Imports

Catálogo em Next.js com produtos, perfis de clientes e imagens no Supabase.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha a URL e a chave pública do Supabase, além do número do WhatsApp com DDI e DDD ou do link curto da loja.
3. Instale as dependências com `npm install` e inicie com `npm run dev`.
4. Aplique as migrações ao projeto ligado com `supabase link` e `supabase db push`.

O catálogo usa o projeto configurado em `supabase/config.toml`. As migrações configuram o catálogo, o bucket `product-images` e a tabela `customer_profiles`. Imagens são públicas para leitura e só administradores podem gravar no Storage. Perfis têm acesso por linha: cada cliente autenticado só pode ler e atualizar os próprios dados.

## Contas de clientes

O cadastro público fica em `/conta/criar`. Depois de confirmar o e-mail e entrar, o cliente pode preencher ou atualizar nome, telefone, endereço, forma de pagamento preferida e observações em `/conta`. O e-mail é mantido pelo Supabase Auth. Os demais dados ficam em `customer_profiles`.

Adicione as URLs de callback à lista de redirecionamentos permitidos em Supabase Auth. Em desenvolvimento, permita `http://localhost:3000/auth/callback` e `http://localhost:3000/auth/password-recovery`. Em produção, permita `https://SEU-DOMINIO/auth/callback` e `https://SEU-DOMINIO/auth/password-recovery`. Configure o envio de e-mails no Supabase para que clientes recebam confirmações e links de redefinição de senha. O formulário salva apenas a preferência de pagamento. Não peça dados de cartão ou conta bancária.

## Acesso administrativo

O login administrativo usa e-mail e senha do Supabase Auth. O cadastro de clientes não concede acesso administrativo. Para criar um administrador, defina `app_metadata.role = "admin"` por um processo confiável no Supabase. O servidor e as políticas RLS do Postgres e Storage verificam essa função. Não atribua essa função pelo navegador.

## Publicação

Configure na Vercel as três variáveis de `.env.example` antes de publicar. A aplicação não usa nem exige uma chave `service_role`.
