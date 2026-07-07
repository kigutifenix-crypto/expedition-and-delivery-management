# 🚚 Expedition and Delivery Management — Fênix Company

[![React](https://img.shields.io/badge/React-v19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v7.3-orange.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-JS%20v2-green.svg)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-API%20Upload-blueviolet.svg)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

O **Expedition and Delivery Management** é um sistema web corporativo de alta performance voltado ao gerenciamento logístico de ponta a ponta da Fênix Company. A aplicação é responsável por gerenciar a expedição de mercadorias, controlar o status de entregas físicas, capturar assinaturas digitais, registrar ocorrências em trânsito, emitir termos de garantia automaticamente e obter avaliações (feedback) dos clientes finais.

---

## 🎯 Principais Funcionalidades

- 🔐 **Autenticação com Supabase Auth:** Login seguro e controle de sessão persistente de usuários.
- 📋 **Gestão de Expedições e Clientes:** Cadastro e rastreamento de lotes de expedição, associando múltiplos pedidos, clientes e transportadores.
- 📦 **Fluxo de Entrega Interativo:**
  - Atualização dinâmica de status da entrega (Pendente, Em Trânsito, Entregue, Ocorrência, Cancelado).
  - Assinatura digital direta na tela utilizando `react-signature-canvas`.
  - Captura e upload de fotos da entrega real (via integração com Cloudinary API).
- 🛡️ **Emissão de Garantias:** Geração automatizada de certificados e termos de garantia baseados nos itens expedidos e dados de faturamento.
- 💬 **Feedback & Satisfação:** Painel para o cliente final registrar avaliações, notas e observações sobre o atendimento e estado das entregas.
- 📑 **Exportador de Comprovantes:** Geração de comprovante de entrega e garantia em formato PDF (via `html2canvas` + `jsPDF`).
- 🔔 **Notificações integradas (WhatsApp/Email):** Mecanismos para envio de termos e links de rastreamento.

---

## 🔄 Fluxo de Operação do Sistema (Ciclo de Vida)

```
[Cadastro de Clientes/Itens]
         │
         ▼
[Criar Nova Expedição] ──(Gera QR Code e Link)
         │
         ▼
[Despachar / Em Trânsito] ──(Registra Ocorrências se houver)
         │
         ▼
[Finalizar Entrega na Tela] ──(Coleta Assinatura Digital + Foto Real do Local)
         │
         ▼
[Geração Automática de Garantia] ──(Opção de Baixar PDF do Termo)
         │
         ▼
[Pesquisa de Satisfação] ──(Cliente atribui nota e comentário)
```

---

## 🗂️ Estrutura de Arquivos

```
expedition-and-delivery-management/
├── src/
│   ├── components/
│   │   ├── Layout.tsx             # Layout global com header e responsividade
│   │   └── Sidebar.tsx            # Navegação lateral por módulos protegidos
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase & lógica de requisições
│   │   └── cloudinary.ts          # Serviço de upload de arquivos de imagem
│   ├── pages/
│   │   ├── Customers/             # Gestão de Clientes (Clientes da Fênix)
│   │   ├── Deliveries/            # Detalhamento e fluxo interativo de entregas
│   │   ├── Expeditions/           # Triagem, criação e edição de expedições
│   │   ├── Feedbacks/             # Listagem e notas de satisfação dos clientes
│   │   ├── Warranties/            # Emissão e listagem de certificados de garantia
│   │   ├── Users/                 # Gestão de colaboradores do sistema (Admin)
│   │   ├── Reports/               # Estatísticas logísticas e relatórios
│   │   └── Settings/              # Configurações de chaves e variáveis do sistema
│   ├── App.tsx                    # Roteador central de rotas e verificações de sessão
│   └── main.tsx                   # Ponto de entrada de renderização React
├── supabase/
│   └── schema.sql                 # Tabelas PostgreSQL e regras RLS estruturadas
├── migration.sql                  # Histórico de alterações e migrações SQL
├── FLOW.md                        # Detalhamento técnico do fluxo operacional
├── SENDING_GUIDE.md               # Manual de remessas e expedições
├── EMAIL_SETUP.md                 # Guia de parametrização de servidores de e-mail
├── WHATSAPP_SETUP.md              # Configuração da API do WhatsApp
├── WHATSAPP_IMPLEMENTATION.md     # Documentação da integração de mensagens instantâneas
├── .env                           # Variáveis de ambiente locais (não versionado)
├── .env.example                   # Modelo de variáveis de ambiente do projeto
├── package.json                   # Dependências e comandos de script npm
├── tsconfig.json                  # Configurações do compilador TypeScript
└── vite.config.ts                 # Configuração de build do bundler Vite
```

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
- **Node.js 20.x** ou superior
- Uma instância ativa no **Supabase**
- Uma conta no **Cloudinary** (para upload de fotos dos comprovantes)

### Passo 1: Instalação das Dependências

Instale os pacotes npm na raiz do projeto:
```bash
npm install
```

### Passo 2: Configurar o Banco de Dados (Supabase)

1. No **SQL Editor** do seu console Supabase, crie uma nova query.
2. Copie e execute o conteúdo de [`supabase/schema.sql`](file:///C:/Users/adm/Documents/MEGA/VSCODE/expedition-and-delivery-management%20(1)/supabase/schema.sql) e [`migration.sql`](file:///C:/Users/adm/Documents/MEGA/VSCODE/expedition-and-delivery-management%20(1)/migration.sql).
3. Isso estruturará todas as tabelas necessárias:
   - `users`: Usuários e colaboradores do sistema.
   - `customers`: Clientes compradores.
   - `expeditions`: Lotes de expedição logística.
   - `deliveries`: Entregas e seus respectivos status.
   - `delivery_photos`: Links das mídias associadas no Cloudinary.
   - `warranties`: Certificados de garantia emitidos.
   - `occurrences`: Registro de problemas em trânsito.
   - `feedbacks`: Avaliações NPS dos clientes.
   - `audit_logs`: Rastreabilidade de ações administrativas.

### Passo 3: Configurar Variáveis de Ambiente

Crie o arquivo `.env` com as chaves do Supabase e Cloudinary:

```env
# Supabase API
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon-key

# Cloudinary Storage API
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_API_KEY=sua_api_key
VITE_CLOUDINARY_API_SECRET=sua_api_secret
```

### Passo 4: Executar em Desenvolvimento

Rode o comando do Vite:
```bash
npm run dev
```
Acesse localmente em: [http://localhost:5173](http://localhost:5173).

---

## 📦 Scripts Disponíveis no `package.json`

- `npm run dev`: Executa a aplicação local com recarregamento automático (HMR).
- `npm run build`: Gera os arquivos estáticos de produção na pasta `dist/`.
- `npm run preview`: Executa localmente o servidor apontando para os arquivos de produção em `dist/`.

---

## 📚 Guias Adicionais

Para detalhes avançados sobre canais de comunicação integrados, consulte:
- ✉️ [Configuração de E-mails Logísticos (EMAIL_SETUP.md)](EMAIL_SETUP.md)
- 💬 [Configuração Geral de WhatsApp (WHATSAPP_SETUP.md)](WHATSAPP_SETUP.md)
- 📝 [Lógica de Integração de Mensageria (WHATSAPP_IMPLEMENTATION.md)](WHATSAPP_IMPLEMENTATION.md)

---

## 📄 Licença

Este software é propriedade intelectual privada da **Fênix Company**.
Todos os direitos reservados, 2026.
