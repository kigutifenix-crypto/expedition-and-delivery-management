# FitLog — Redesign UI/UX (Clean Corporativo)

Arquivos prontos para substituir no seu repositório (mesmos caminhos, mesmos nomes
de export e mesmas props — é drop-in, sem mudança de lógica de negócio).

## O que substituir

```
src/index.css                       (novo design system em tokens)
src/components/Layout.tsx
src/components/Sidebar.tsx
src/components/nav-items.ts         (NOVO — menu agrupado)
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Table.tsx
src/components/ui/Modal.tsx
src/components/ui/Pagination.tsx
src/components/ui/ConfirmDialog.tsx
src/components/ui/MessageDialog.tsx
src/components/ui/PromptDialog.tsx
src/components/ui/Badge.tsx         (NOVO — StatusBadge + statusTone)
src/components/ui/Input.tsx         (NOVO)
src/components/ui/PageHeader.tsx    (NOVO)
src/components/ui/StatCard.tsx      (NOVO)
src/pages/Login.tsx
src/pages/Dashboard.tsx
```

Nenhum outro arquivo precisa mudar para o app já ficar com a nova cara: o
`index.css` inclui uma camada de compatibilidade que realinha as classes cruas
(`slate-*`, `bg-white`, `rounded-xl`, `shadow-sm`) usadas nas telas legadas.

## Fonte

Adicione no `index.html`, dentro de `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

## Design system

- **Paleta:** canvas `#f7f8fa`, superfície branca, marca `brand-500 #2563eb` /
  `brand-700 #1f3a8a`, tinta `#0f172a`. Status: success/warning/danger/info.
- **Tokens Tailwind v4** em `@theme` → use `bg-surface`, `text-ink`,
  `text-ink-soft`, `border-line`, `bg-brand-50`, `text-brand-700`, etc.
- **Utilitários:** `surface-card`, `field`, `label-field`, `badge-base`,
  `text-eyebrow`, `animate-rise`, `skeleton`.
- **Regra:** não escreva cor crua em componente novo; use os tokens acima.

## Como migrar o resto das telas (padrão a seguir)

1. Topo da página: `<PageHeader eyebrow title description actions />`.
2. Blocos: `<Card>` (ou `<Card flush>` quando tiver tabela/lista full-bleed) +
   `<CardHeader />`.
3. Filtros/formulários: `<Input />` ou `className="field"` + `label-field`.
4. Status: `<StatusBadge status={row.status} />` (cores automáticas por status).
5. Ações: `<Button variant="default | secondary | outline | subtle | ghost | danger" />`.
6. Listagens: `<Table />` (skeleton e estado vazio já inclusos) + `<Pagination />`
   dentro do mesmo `Card flush`.

## Principais melhorias de UX

- Sidebar agrupada por contexto (Operação / Pós-venda / Gestão) com item ativo
  em pílula navy e hierarquia legível.
- Topbar com busca destacada, avatar com iniciais, cargo do usuário e footer fixo.
- Login em duas colunas: painel de marca com prova de valor + formulário enxuto,
  labels reais, erro amigável (sem mensagem crua do backend) e autocomplete.
- Dashboard: KPIs clicáveis com skeleton de carregamento, gráficos com grid suave
  e tooltip em card, lista de expedições com estado vazio acionável.
- Tabelas: cabeçalho sticky, hover azul suave, skeleton, empty state com orientação.
- Modais: fecha com ESC, trava o scroll do body, hierarquia título/descrição.
- Acessibilidade: `:focus-visible` visível, `aria-label` nos botões de ícone,
  contraste de texto revisado (nada de cinza claro sobre branco).
