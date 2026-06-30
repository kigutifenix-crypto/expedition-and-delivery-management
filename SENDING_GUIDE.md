# 📧 Sistema de Envio Automático - WhatsApp + Email

## 🎯 Objetivo

Quando uma entrega é **finalizada**, o sistema envia automaticamente o PDF do guia de cuidados Fenix para o cliente através de:
- ✅ **Email** (GRÁTIS - 100/dia via Resend)
- ✅ **WhatsApp** (Se configurado)

## 📊 Arquitetura

```
Finalização da Entrega
        ↓
  ✅ Status = 'finalizado'
        ↓
  ✅ Garantia de 90 dias criada
        ↓
  ┌─────┴──────┐
  ↓            ↓
EMAIL       WhatsApp
(Resend)    (API externa)
  ↓            ↓
PDF enviado   PDF enviado
  ↓            ↓
Registrado   Registrado
```

## 📁 Arquivos Criados/Modificados

### Backend Functions
```
supabase/functions/
├── send-email/
│   └── index.ts          ← Envia email via Resend API
└── send-whatsapp/
    └── index.ts          ← Envia WhatsApp (já existia)
```

### Frontend Utilities
```
src/utils/
├── email.ts              ← ✨ NOVO - Funções de email
└── whatsapp.ts           ← Funções de WhatsApp
```

### React Components
```
src/pages/Deliveries/
└── DeliveryDetail.tsx    ← MODIFICADO - Integração de email
```

### Database
```
migration.sql            ← MODIFICADO
├── Tabela email_messages (✨ NOVO)
└── RLS policies para email_messages
```

### Documentation
```
├── EMAIL_SETUP.md        ← ✨ NOVO - Guia Resend
├── WHATSAPP_SETUP.md     ← Documentação WhatsApp
├── WHATSAPP_IMPLEMENTATION.md
├── .env.example          ← MODIFICADO
└── README.md             ← Este arquivo
```

## 🚀 Quick Start

### Opção 1: Setup EMAIL (Recomendado - Gratuito)

```bash
# 1. Criar conta Resend
# https://resend.com → Sign Up → Grátis

# 2. Copiar API Key (começa com "re_")

# 3. Adicionar ao Supabase
supabase secrets set RESEND_API_KEY=re_sua_chave_aqui

# 4. Deploy função
supabase functions deploy send-email

# 5. Pronto! Sistema pronto para enviar emails
```

**Mais detalhes:** [EMAIL_SETUP.md](EMAIL_SETUP.md)

### Opção 2: Setup WHATSAPP (Se tiver API)

```bash
# 1. Obter credenciais WhatsApp API (Meta/Twilio/Evolution)

# 2. Adicionar ao Supabase
supabase secrets set WHATSAPP_API_URL=https://...
supabase secrets set WHATSAPP_API_TOKEN=seu_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=seu_id

# 3. Deploy função
supabase functions deploy send-whatsapp

# 4. Pronto!
```

**Mais detalhes:** [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) e [WHATSAPP_IMPLEMENTATION.md](WHATSAPP_IMPLEMENTATION.md)

## 📋 Requisitos de Dados

### Para EMAIL funcionar:
- ✅ Cliente com campo `email` preenchido
- ✅ Ou expedição com campo `client_email`

Verificar:
```sql
SELECT id, name, email FROM customers WHERE email IS NULL;
```

### Para WhatsApp funcionar:
- ✅ Cliente com campo `phone` preenchido
- ✅ Formato: +55 (código país) + DDD + número

Verificar:
```sql
SELECT id, name, phone FROM customers WHERE phone IS NULL;
```

## 🔍 Fluxo Completo

### Quando Usuário Finaliza Entrega:

```
1. Status muda para 'finalizado'
   ↓
2. Feedback salvo (ou pulado)
   ↓
3. Garantia criada (90 dias)
   ↓
4. 🚀 Email enviado:
   - Busca email do cliente
   - Cria HTML profissional
   - Resend envia com PDF em anexo
   - Registra em email_messages
   ↓
5. 🚀 WhatsApp enviado (se configurado):
   - Busca telefone do cliente
   - Envia mensagem + PDF
   - Registra em whatsapp_messages
   ↓
6. ✅ Entrega concluída
```

## 📊 Monitoramento

### Ver emails enviados:
```sql
SELECT 
  email,
  subject,
  status,
  sent_at
FROM email_messages 
ORDER BY sent_at DESC
LIMIT 20;
```

### Ver WhatsApp enviados:
```sql
SELECT 
  phone,
  message_type,
  status,
  sent_at
FROM whatsapp_messages 
WHERE message_type = 'GARANTIA'
ORDER BY sent_at DESC
LIMIT 20;
```

### Dashboard de status:
```sql
SELECT 
  'Email' as canal,
  status,
  COUNT(*) as total
FROM email_messages
GROUP BY status

UNION ALL

SELECT 
  'WhatsApp' as canal,
  status,
  COUNT(*) as total
FROM whatsapp_messages
WHERE message_type = 'GARANTIA'
GROUP BY status;
```

## 📝 Conteúdo do Email

```
Assunto: ✅ Guia de Garantia - Equipamento {pedido}

Corpo:
- Saudação personalizada
- Confirmação da entrega
- Informação de garantia 90 dias
- Tópicos cobertos no guia
- Instruções para manter garantia
- Contatos de suporte
- Branding Fenix

Anexo: 📎 PDF Fenix (auto-anexado)
```

## 🔐 Segurança

✅ API Keys não são expostas (stay no backend)
✅ PDF é downloadado dinamicamente
✅ Emails/Telefones não estão em logs públicos
✅ RLS policies protegem dados
✅ Falhas não bloqueiam finalização

## ⚠️ Limitações & Planos Futuros

### Atuais:
- 100 emails/dia (Resend free tier)
- Email simples em HTML (sem CMS)
- Sem scheduling automático

### Futuro:
- [ ] Template customizável via Admin
- [ ] Agendamento de envios
- [ ] A/B testing de templates
- [ ] Múltiplos idiomas
- [ ] Reenvio automático se falhar
- [ ] Integração com SMS

## 🆘 Troubleshooting

### Email não é recebido:
1. Verificar se cliente tem email no banco
2. Checar caixa de spam
3. Validar que Resend API Key está ativa
4. Ver logs: `supabase functions logs send-email`

### WhatsApp não é enviado:
1. Verificar se cliente tem telefone no banco
2. Validar formato de telefone (+55...)
3. Checar se API WhatsApp está ativa
4. Ver logs: `supabase functions logs send-whatsapp`

### Erros de Deploy:
```bash
# Redeploy função
supabase functions deploy send-email --no-verify-jwt

# Verificar secrets
supabase secrets list

# Testar localmente
supabase functions serve send-email
```

## 📚 Documentação Detalhada

- [EMAIL_SETUP.md](EMAIL_SETUP.md) - Setup Resend (READ THIS!)
- [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) - Setup WhatsApp
- [WHATSAPP_IMPLEMENTATION.md](WHATSAPP_IMPLEMENTATION.md) - Implementação WhatsApp

## 💻 Código Importante

### Envio de Email:
```typescript
// src/utils/email.ts
await sendFenixGuideEmailAfterDelivery(
  deliveryId,
  customerEmail,
  customerName,
  equipmentName
);
```

### Envio de WhatsApp:
```typescript
// src/utils/whatsapp.ts
await sendFenixGuideAfterDelivery(
  deliveryId,
  customerPhone,
  customerName,
  equipmentName
);
```

### Logging:
```typescript
// Ambos registram em banco
await logEmailMessage(id, customerId, email, subject, status);
await logWhatsAppMessage(id, customerId, phone, 'GARANTIA', message, status);
```

## 🎯 Próximos Passos

1. **Email** → Siga [EMAIL_SETUP.md](EMAIL_SETUP.md)
2. **WhatsApp** (opcional) → Siga [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md)
3. Testar um envio completo
4. Monitorar logs e banco de dados
5. Customizar templates conforme necessário

## 📞 Support

Se encontrar problemas:
1. Verificar os logs no Supabase Dashboard
2. Testar a API manualmente (curl/Postman)
3. Validar dados no banco
4. Verificar variáveis de ambiente (.env)

---

**Pronto para começar!** 🚀

1️⃣ Email é grátis e simples - comece por lá!
2️⃣ WhatsApp é opcional - adicione depois se precisar
3️⃣ Ambos funcionam juntos sem conflitos
