# Guia de Implementação - Envio de PDF Fenix via WhatsApp

## 🎯 Objetivo
Enviar automaticamente o guia de garantia Fenix via WhatsApp quando uma entrega é finalizada.

**💡 NOVO:** Sistema também envia por **Email** simultaneamente! Veja [EMAIL_SETUP.md](EMAIL_SETUP.md)

## 📋 Pré-requisitos
- [ ] Conta Cloudinary (ou Supabase Storage)
- [ ] Conta WhatsApp Business / Twilio / Evolution API
- [ ] Acesso ao Supabase Dashboard
- [ ] Projeto rodando localmente

## ✅ Passo 1: Upload do PDF Fenix ao Cloudinary

### 1.1 Fazer Upload
1. Acesse [cloudinary.com](https://cloudinary.com) (use a mesma conta do projeto)
2. Vá para **Media Library** → **Upload**
3. Selecione o arquivo PDF `Fenix_Cuidados_Garantia.pdf`
4. Configure como **raw file** (não image)

### 1.2 Copiar URL Pública
1. Após upload, clique no arquivo
2. Copie a **Public URL** que aparece
3. Deve ser algo como: `https://res.cloudinary.com/seu-cloud/raw/upload/v1/fenix-garantia-guide.pdf`

### 1.3 Adicionar ao `.env.local`
```env
VITE_FENIX_GUIDE_PDF_URL=https://res.cloudinary.com/seu-cloud/raw/upload/v1/fenix-garantia-guide.pdf
```

## ✅ Passo 2: Configurar WhatsApp API

### Opção A: Meta/Twilio (Recomendado)

#### 2A.1 Criar Conta WhatsApp Business
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um App → WhatsApp
3. Configure um número de teste ou número de negócio

#### 2A.2 Obter Credenciais
1. **Phone Number ID**: Vá em **Configurações → Número de Telefone** → Copie o ID
2. **Business Account ID**: Em **Configurações → Informações de Negócio**
3. **API Token**: Crie um token em **Configurações → Tokens do Sistema** → Copie

#### 2A.3 Adicionar ao Supabase
```bash
# No terminal, faça login no Supabase
supabase login

# Adicione os secrets
supabase secrets set --project-id seu-projeto-id WHATSAPP_API_URL=https://graph.instagram.com/v18.0
supabase secrets set --project-id seu-projeto-id WHATSAPP_API_TOKEN=seu_token_aqui
supabase secrets set --project-id seu-projeto-id WHATSAPP_PHONE_NUMBER_ID=seu_numero_id
```

### Opção B: Evolution API

#### 2B.1 Setup Evolution
1. Deploy ou acesse sua instância Evolution API
2. Configure a instância WhatsApp
3. Obtenha as credenciais de API

#### 2B.2 Adicionar ao Supabase
```bash
supabase secrets set --project-id seu-projeto-id WHATSAPP_API_URL=https://seu-servidor-evolution.com
supabase secrets set --project-id seu-projeto-id WHATSAPP_API_TOKEN=seu_token_evolution
supabase secrets set --project-id seu-projeto-id WHATSAPP_PHONE_NUMBER_ID=sua_instancia_id
```

## ✅ Passo 3: Deploy da Função Supabase

### 3.1 Deploy Local
```bash
# Na raiz do projeto
supabase functions deploy send-whatsapp
```

### 3.2 Verificar Deployment
```bash
supabase functions list

# Deve aparecer: send-whatsapp (active)
```

### 3.3 Testar Função (Opcional)
```bash
supabase functions serve send-whatsapp
```

## ✅ Passo 4: Verificar Banco de Dados

### 4.1 Adicionar Campo de Telefone
Verifique se a tabela `customers` tem campo `phone`:

```sql
-- Se não existir, adicione:
ALTER TABLE public.customers 
ADD COLUMN phone TEXT;

-- Atualize com dados dos clientes
UPDATE public.customers 
SET phone = '5511999999999' 
WHERE id = 'seu-cliente-id';
```

### 4.2 Verificar Tabela WhatsApp
```sql
-- A tabela já deve existir
SELECT * FROM public.whatsapp_messages LIMIT 1;
```

## ✅ Passo 5: Testar o Sistema

### 5.1 Teste Local
1. Inicie o projeto: `npm run dev`
2. Vá para uma entrega existente
3. Finalize a entrega normalmente
4. Verifique:
   - Se o status mudou para `finalizado`
   - Se o feedback foi salvo
   - No console do navegador: procure por "Guia Fenix enviado"

### 5.2 Verificar Logs
```bash
# Acesse Supabase Dashboard → Logs
# Filtre por: send-whatsapp
# Procure por erros ou sucessos
```

### 5.3 Verificar Banco
```sql
SELECT * FROM whatsapp_messages 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🔧 Troubleshooting

### Erro: "WhatsApp API not configured"
**Solução:**
```bash
# Verifique se os secrets foram adicionados
supabase secrets list

# Se não aparecer, adicione novamente
supabase secrets set WHATSAPP_API_URL=...
supabase secrets set WHATSAPP_API_TOKEN=...
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=...

# Deploy novamente
supabase functions deploy send-whatsapp
```

### Erro: "Customer phone not found"
**Solução:**
1. Verifique se o cliente existe no banco:
```sql
SELECT id, name, phone FROM customers WHERE id = 'seu-cliente-id';
```

2. Adicione o telefone:
```sql
UPDATE customers SET phone = '5511999999999' WHERE id = 'seu-cliente-id';
```

### Mensagem não chega
**Verifique:**
1. Número no formato correto: +55 (Brasil) + DDD + número (com 9)
2. Se o token é válido
3. Se o API URL está correto
4. Se a instância WhatsApp está ativa

```bash
# Teste a API manualmente
curl -X POST "https://graph.instagram.com/v18.0/seu-numero-id/messages" \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "55119999999",
    "type": "text",
    "text": {"body": "Teste"}
  }'
```

## 📊 Monitoramento

### Dashboard de Mensagens
```sql
-- Último envio
SELECT 
  delivery_id,
  phone,
  message_type,
  status,
  sent_at
FROM whatsapp_messages 
WHERE message_type = 'GARANTIA'
ORDER BY sent_at DESC
LIMIT 10;

-- Taxa de sucesso
SELECT 
  status,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentual
FROM whatsapp_messages
WHERE message_type = 'GARANTIA'
GROUP BY status;
```

## 🚀 Próximas Etapas

1. **Customização da Mensagem**: Editar em `src/utils/whatsapp.ts`
2. **Template WhatsApp Aprovado**: Usar templates pré-aprovados para melhor taxa
3. **Agendamento**: Enviar em horários específicos
4. **QR Code**: Adicionar QR do portal do cliente
5. **Múltiplos Idiomas**: Suporte a outros idiomas

## 📚 Referências

- [Meta WhatsApp API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Twilio WhatsApp API](https://www.twilio.com/en-us/messaging/whatsapp)
- [Evolution API Docs](https://evolution-api.com/)
- [Supabase Functions](https://supabase.com/docs/guides/functions)

## ❓ Dúvidas

Se encontrar problemas:
1. Verificar os logs do Supabase Dashboard
2. Testar a API WhatsApp manualmente
3. Verificar se o banco de dados tem os dados corretos
4. Verificar se as variáveis de ambiente estão corretas
