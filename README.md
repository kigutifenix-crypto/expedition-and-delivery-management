# Expedition and Delivery Management

Sistema web de gestão de expedições, entregas, garantias, feedbacks e usuários, construido com React, Vite, Tailwind CSS e Supabase.

## Visão geral

Este projeto oferece um painel administrativo para:

- Gerenciar expedições e entregas
- Capturar assinaturas e fotos de entregas
- Criar garantias automaticamente a partir de entregas
- Registrar feedbacks de clientes
- Controlar usuários e autenticação via Supabase
- Exibir relatórios e métricas simples

## Tecnologias

- React 19
- Vite 7
- TypeScript 5
- Tailwind CSS 4
- Supabase JS 2
- Lucide Icons
- Recharts
- QRCode
- Cloudinary upload via API
- html2canvas e jsPDF para geração de PDF

## Estrutura do projeto

- `src/App.tsx`: rotas e autenticação de sessão
- `src/lib/supabase.ts`: cliente Supabase e upload de fotos de entrega
- `src/lib/cloudinary.ts`: integração de upload com Cloudinary
- `src/pages/Expeditions`: gerenciamento de expedições
- `src/pages/Deliveries`: detalhes e fluxo de entregas
- `src/pages/Feedbacks`: lista e detalhe de feedbacks
- `src/pages/Warranties`: exibição de garantias
- `src/pages/Customers`: clientes
- `src/pages/Users`: usuários do sistema
- `src/components/Layout.tsx`: layout geral do painel
- `src/components/Sidebar.tsx`: navegação lateral
- `supabase/schema.sql`: esquema de banco de dados e políticas
- `migration.sql`: migrações e histórico de schema

## Rotas principais

- `/login` — tela de login
- `/` — dashboard principal
- `/expedicoes` — lista de expedições
- `/expedicoes/nova` — cadastro de nova expedição
- `/expedicoes/:id` — detalhe da expedição
- `/expedicoes/:id/editar` — edição de expedição
- `/entregas` — lista de entregas
- `/entregas/:id` — detalhes da entrega
- `/entregas/:id/editar` — edição de entrega
- `/clientes` — lista de clientes
- `/clientes/:id` — detalhe do cliente
- `/feedbacks` — lista de feedbacks
- `/garantias` — lista de garantias
- `/relatorios` — relatórios
- `/usuarios` — lista de usuários
- `/configuracoes` — configurações do app

## Funcionalidades principais

- Login com Supabase Auth
- Dashboard com métricas de entregas e feedbacks
- Cadastro e edição de expedições
- Fluxo de entrega com etapas de status, assinatura, fotos e finalização
- Criação de garantia associada à expedição/entrega
- Registro de feedbacks de clientes com notas e comentários
- Visualização clicável de feedbacks
- Upload de fotos em Cloudinary para entregas
- Geração de PDF de comprovante de entrega
- RLS / políticas configuradas no Supabase

## Requisitos

- Node.js 20+ recomendado
- Conta Supabase ou ambiente local compatível
- Conta Cloudinary para upload de imagens

## Configuração local

1. Clone o repositório

```bash
git clone <seu-repositorio>.git
cd expedition-and-delivery-management
```

2. Instale dependências

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto com as variáveis:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<seu-anon-key>
VITE_CLOUDINARY_CLOUD_NAME=<seu-cloud-name>
VITE_CLOUDINARY_API_KEY=<sua-api-key>
VITE_CLOUDINARY_API_SECRET=<sua-api-secret>
```

> O projeto contém valores padrão embedados em `src/lib/supabase.ts` e `src/lib/cloudinary.ts`, mas é recomendado usar variáveis de ambiente para produção.

4. Execute o projeto

```bash
npm run dev
```

5. Acesse

```
http://localhost:5173
```

## Supabase e banco de dados

O esquema Supabase está em `supabase/schema.sql` e inclui tabelas para:

- `users`
- `customers`
- `expeditions`
- `deliveries`
- `delivery_photos`
- `warranties`
- `occurrences`
- `feedbacks`
- `audit_logs`

O código também contém `migration.sql` com histórico de alterações, triggers e políticas de RLS.

### Pontos importantes

- A aplicação usa `delivery_id`, `expedition_id` e `customer_id` para relacionar dados
- Feedbacks são salvos em `feedbacks` e exibidos em `src/pages/Feedbacks/FeedbackList.tsx`
- Upload de imagens de entrega depende de Cloudinary e usa a pasta `deliveries/<deliveryId>` no bucket

## Scripts disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — gera a build de produção
- `npm run preview` — roda a aplicação de produção localmente

## Observações para commit/push

- Atualize os arquivos `.env` apenas localmente; não inclua chaves secretas no Git
- Verifique se `README.md` e `package.json` estão atualizados
- Se precisar, adicione `.gitignore` para evitar o push de arquivos de ambiente

## Contribuição

1. Crie uma branch de feature:

```bash
git checkout -b feature/nome-da-funcionalidade
```

2. Faça as alterações
3. Rode os testes manuais ou a aplicação localmente
4. Faça commit com mensagem clara
5. Envie para o repositório remoto

## Contato

Para dúvidas sobre o sistema, use os recursos do Supabase e Cloudinary, ou revise o arquivo `FLOW.md` para o fluxo de expedição esperado.
