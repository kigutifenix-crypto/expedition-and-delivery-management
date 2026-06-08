# Supabase Setup

1. O projeto Supabase já está configurado para a instância:
   - URL: `https://ynzlczkqtlytswxobnvc.supabase.co`
   - Chave publishable: `sb_publishable_T4cZRqR95AOIIFj7c-eOqg_CHo5xU5B`
2. No workspace, crie um arquivo `.env` com:

```
VITE_SUPABASE_URL=https://ynzlczkqtlytswxobnvc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_T4cZRqR95AOIIFj7c-eOqg_CHo5xU5B
```

3. No SQL Editor do Supabase, cole e execute o arquivo `supabase/schema.sql`.
4. No Storage do Supabase, crie um bucket chamado `delivery-photos`.
5. No painel de Policies, confirme que as tabelas com RLS estão habilitadas.

> Esta aplicação usa a chave publishable no navegador. As chaves secretas (`sb_secret_...`) devem ser usadas apenas em backend/server-side.

> A aplicação usa `src/lib/supabase.ts` para conectar ao Supabase.

## Observações

- A camada de autenticação é feita com Supabase Auth.
- A página de clientes foi adicionada em `src/pages/Customers`.
- A tela de entrega agora suporta upload de fotos, assinatura e geração de PDF.
- Se o `npm install` falhar por arquivos bloqueados, feche processos em `node_modules` e tente novamente com:

```bash
npm install --legacy-peer-deps
```
