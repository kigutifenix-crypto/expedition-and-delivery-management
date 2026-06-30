# Envio Automático de PDF por Email - Guia de Configuração

## 🎯 Visão Geral

O sistema agora envia automaticamente o PDF do guia de garantia Fenix para o cliente por **email** quando uma entrega é finalizada. É uma solução **100% gratuita** usando a API Resend.

## 📋 Pré-requisitos

- Conta Resend (100 emails/dia - GRÁTIS)
- PDF Fenix armazenado (já adicionado ao Cloudinary ✅)
- Email do cliente cadastrado no sistema
- Acesso ao Supabase Dashboard

## ✅ Passo 1: Criar Conta Resend

### 1.1 Acesse Resend
1. Vá para [resend.com](https://resend.com)
2. Clique em "Sign Up"
3. Use seu email pessoal ou corporativo
4. Confirme o email

### 1.2 Plano Gratuito
- ✅ 100 emails/dia
- ✅ Acesso total a todas as features
- ❌ Sem taxa de processamento
- Perfeito para começar!

## ✅ Passo 2: Obter API Key

### 2.1 Gerar API Key
1. No dashboard Resend, vá para **API Keys**
2. Clique em **"Create API Key"**
3. Selecione **"Production"** ou **"Test"** (comece com Test)
4. Copie a chave (vai começar com `re_`)

Exemplo: `re_abc123xyz789`

### 2.2 Verificar Domain (Opcional, para Production)
Para usar um domínio customizado:
1. Vá em **Domains**
2. Adicione seu domínio
3. Siga as instruções de DNS
4. Após verificado, use nos emails

## ✅ Passo 3: Adicionar ao Supabase

### 3.1 Configurar Secrets
```bash
# No terminal, faça login
supabase login

# Adicione a chave Resend
supabase secrets set --project-id seu-projeto-id RESEND_API_KEY=re_abc123xyz789

# (Opcional) Adicione email de envio customizado
supabase secrets set --project-id seu-projeto-id SENDER_EMAIL=noreply@shoppingdasacademias.com.br
```

### 3.2 Verificar Secrets
```bash
supabase secrets list --project-id seu-projeto-id

# Deve aparecer:
# RESEND_API_KEY
# SENDER_EMAIL (se adicionou)
```

## ✅ Passo 4: Deploy da Função Email

### 4.1 Deploy
```bash
# Na raiz do projeto
supabase functions deploy send-email
```

### 4.2 Verificar Deployment
```bash
supabase functions list

# Deve aparecer: send-email (active)
```

## ✅ Passo 5: Garantir Dados Corretos

### 5.1 Adicionar Email aos Clientes
```sql
-- Verificar se clientes têm email
SELECT id, name, email FROM customers WHERE email IS NULL;

-- Atualizar emails
UPDATE customers 
SET email = 'seu-email@dominio.com.br' 
WHERE id = 'seu-cliente-id';
```

### 5.2 Verificar Campos Necessários
O sistema tenta buscar email em dois lugares:
1. **Tabela customers** → campo `email` (preferido) ✅
2. **Tabela expeditions** → campo `client_email` (fallback)

## ✅ Passo 6: Testar o Sistema

### 6.1 Teste de Entrega
1. Inicie o projeto: `npm run dev`
2. Vá para uma entrega
3. Finalize a entrega (status = finalizado)
4. Forneça feedback ou pule
5. **Verifique o email do cliente** - deve receber o PDF!

### 6.2 Logs
No Supabase Dashboard:
1. Vá para **Logs** → **Functions**
2. Filtre por `send-email`
3. Procure por:
   - ✅ Sucesso: `"success": true`
   - ❌ Erro: `"error": "..."`

### 6.3 Banco de Dados
```sql
-- Verificar emails enviados
SELECT 
  delivery_id,
  email,
  subject,
  status,
  sent_at
FROM email_messages 
ORDER BY sent_at DESC 
LIMIT 10;
```

## 📧 Conteúdo do Email

O email enviado contém:
- ✅ Saudação personalizada (com nome do cliente)
- ✅ Confirmação da entrega
- ✅ Informação sobre garantia de 90 dias
- ✅ **PDF do guia Fenix em anexo**
- ✅ Tópicos abordados no guia
- ✅ Contatos de suporte
- ✅ Design profissional com branding Fenix

## 🔧 Troubleshooting

### Erro: "Resend API key not configured"
**Solução:**
```bash
# Verifique se o secret foi adicionado
supabase secrets list

# Se não aparecer, adicione novamente
supabase secrets set RESEND_API_KEY=re_sua_chave
supabase functions deploy send-email
```

### Email não é recebido
**Verificar:**
1. ✅ Cliente tem email no banco? 
   ```sql
   SELECT email FROM customers WHERE id = 'seu-id';
   ```

2. ✅ Email está na caixa de spam?
   - Resend é confiável, mas alguns domínios podem ir para spam
   - Usar domínio customizado verificado ajuda

3. ✅ API Key é válida?
   - Teste no Resend Dashboard → **API Keys**
   - Copie a chave completa (sem espaços)

4. ✅ PDF existe?
   - Teste a URL: [https://res.cloudinary.com/...](https://res.cloudinary.com/dtz57uydi/raw/upload/v1719662697/Cuidados_essenciais_para_nao_perder_a_garantia_do_seu_equipamento_seminovo_n7tqkb.pdf)
   - Deve baixar o PDF

### Email de teste
```bash
# Envie um email de teste via Resend
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_sua_chave" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "seu-email@dominio.com",
    "subject": "Teste",
    "html": "<p>Teste funcionando!</p>"
  }'
```

## 📊 Monitoramento

### Dashboard de Emails
```sql
-- Todos os emails enviados
SELECT 
  email,
  subject,
  status,
  sent_at,
  created_at
FROM email_messages 
WHERE status = 'sent'
ORDER BY sent_at DESC;

-- Taxa de sucesso
SELECT 
  status,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentual
FROM email_messages
GROUP BY status;

-- Últimos 30 dias
SELECT 
  DATE_TRUNC('day', sent_at) as data,
  COUNT(*) as emails_enviados
FROM email_messages
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', sent_at)
ORDER BY data DESC;
```

## 🚀 Próximas Melhorias

- [ ] Personalizar template de email (cores, logo, etc)
- [ ] Adicionar QR Code do portal no email
- [ ] Múltiplos idiomas nos emails
- [ ] Agendamento de envios
- [ ] Reenvio automático se falhar
- [ ] A/B testing de templates

## 💡 Dicas

### Para Aumentar Taxa de Entrega
1. **Use domínio customizado** (não o padrão da Resend)
2. **Valide o SPF e DKIM** do seu domínio
3. **Use layout responsivo** nos emails
4. **Incluir unsubscribe link** (recomendado)
5. **Evitar spam triggers** (muitas imagens, links suspeitos)

### Escalabilidade
- 100 emails/dia é suficiente para ~3-5 entregas
- Se precisar mais, Resend oferece planos pagos
- Alternativas: Brevo (300/dia), Mailgun (free tier)

### Segurança
- ✅ API Key nunca é exposta (stays no backend)
- ✅ PDF é downloadado dinamicamente
- ✅ Email do cliente não é visível no código frontend
- ✅ Logs são registrados no banco

## 📚 Referências

- [Resend Docs](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/emails/send)
- [Supabase Functions](https://supabase.com/docs/guides/functions)

## ❓ FAQ

**P: Por quanto tempo recebo 100 emails/dia?**
R: Indefinidamente, é o plano gratuito permanente.

**P: Posso enviar de um domínio customizado?**
R: Sim, basta verificar o domínio. Melhora entrega e profissionalismo.

**P: O PDF sempre é anexado?**
R: Sim, ou falha o envio. Se o PDF URL estiver inválida, ele tenta sem anexo.

**P: E se o cliente não tiver email?**
R: O sistema simplesmente pula o envio de email. Não bloqueia a finalização.

**P: Preciso fazer algo no Resend periodicamente?**
R: Não, é automático. Apenas monitore seu uso no dashboard.

**P: Posso customizar o template do email?**
R: Sim! Edite em `src/utils/email.ts` → `sendFenixGuideEmailAfterDelivery()`
