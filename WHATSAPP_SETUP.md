# Envio Automático do PDF Fenix via WhatsApp

## Descrição

Quando uma entrega é finalizada no sistema, um PDF com o guia completo de cuidados e garantia do equipamento Fenix é automaticamente enviado para o cliente via WhatsApp, junto com uma mensagem personalizada.

**💡 NOVO:** Sistema agora também envia por **EMAIL** (grátis via Resend)! Veja [EMAIL_SETUP.md](EMAIL_SETUP.md)

## Fluxo de Funcionamento

1. **Finalização da Entrega**: Quando o status da entrega muda para `finalizado`
2. **Criação da Garantia**: Uma garantia de 90 dias é criada automaticamente
3. **Envio do Feedback**: Cliente avalia a entrega (ou pula)
4. **Envio do WhatsApp**: O sistema envia automaticamente:
   - Uma mensagem de texto personalizada
   - O PDF do guia Fenix em anexo

## Pré-requisitos

### 1. PDF Fenix Armazenado

O PDF deve estar disponível em uma URL pública. Você pode:

**Opção A: Cloudinary (Recomendado)**
- Fazer upload do PDF para o Cloudinary
- Usar a URL pública do arquivo
- Adicionar a URL em `VITE_FENIX_GUIDE_PDF_URL`

**Opção B: Supabase Storage**
- Fazer upload para bucket público
- Gerar URL pública
- Adicionar a URL em `VITE_FENIX_GUIDE_PDF_URL`

### 2. API WhatsApp Configurada

O sistema suporta qualquer API WhatsApp (Twilio, Evolution API, MessageBird, etc.).

#### Configuração com Twilio (Exemplo)

1. Criar conta em [twilio.com](https://www.twilio.com)
2. Configurar número WhatsApp
3. Gerar API Token
4. Adicionar variáveis de ambiente no Supabase:

```bash
WHATSAPP_API_URL=https://graph.instagram.com/v18.0  # Meta API
WHATSAPP_API_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
```

#### Configuração com Evolution API

```bash
WHATSAPP_API_URL=https://seu-servidor.com/api  # URL da Evolution
WHATSAPP_API_TOKEN=seu_token_api
WHATSAPP_PHONE_NUMBER_ID=seu_instance_id
```

## Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```env
# URL pública do PDF Fenix
VITE_FENIX_GUIDE_PDF_URL=https://res.cloudinary.com/seu-cloud/raw/upload/v1/fenix-garantia-guide.pdf

# Variáveis do servidor (Supabase)
WHATSAPP_API_URL=https://seu-api-url.com
WHATSAPP_API_TOKEN=seu_token_secreto
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
```

### Supabase Functions

1. Deploy da função:
```bash
supabase functions deploy send-whatsapp
```

2. Adicionar secrets no Supabase:
```bash
supabase secrets set WHATSAPP_API_URL=https://seu-api-url.com
supabase secrets set WHATSAPP_API_TOKEN=seu_token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
```

### Banco de Dados

A tabela `whatsapp_messages` já está criada e armazena:
- `delivery_id`: ID da entrega
- `customer_id`: ID do cliente
- `phone`: Número do cliente
- `message_type`: Tipo de mensagem (ENTREGA, GARANTIA, etc)
- `message_content`: Conteúdo da mensagem
- `status`: pending, sent, delivered, failed
- `sent_at`: Data/hora do envio

## Arquivos Relacionados

### Frontend
- `src/utils/whatsapp.ts` - Utilitários para envio e logging
- `src/pages/Deliveries/DeliveryDetail.tsx` - Integração no fluxo de finalização

### Backend
- `supabase/functions/send-whatsapp/index.ts` - Função Supabase para enviar mensagens

### Banco de Dados
- Tabela `whatsapp_messages` - Histórico de mensagens
- Tabela `customers` - Informações do cliente (incluindo telefone)
- Tabela `deliveries` - Status das entregas

## Fluxo de Código

```
DeliveryDetail.tsx
  ↓
submitFeedback() ou skipFeedbackAndFinalize()
  ↓
Atualizar status para 'finalizado'
  ↓
sendFenixGuideAfterDelivery()
  ↓
sendWhatsAppMessage()
  ↓
supabase.functions.invoke('send-whatsapp')
  ↓
Supabase Function envia para WhatsApp API
  ↓
logWhatsAppMessage() registra no banco
```

## Tratamento de Erros

Se o envio WhatsApp falhar:
1. A entrega **continua finalizada** (não é bloqueada)
2. Um log de erro é registrado no console
3. O status da mensagem fica como `failed` no banco
4. Um aviso é exibido na interface

## Personalização

### Modificar Mensagem

Edite a função `sendFenixGuideAfterDelivery()` em `src/utils/whatsapp.ts`:

```typescript
const message = `Olá ${customerName}! 👋\n\nSua entrega foi finalizada...`
```

### Adicionar Template

Para usar templates WhatsApp pré-aprovados:

```typescript
payload: {
  messaging_product: "whatsapp",
  to: phone,
  type: "template",
  template: {
    name: "fenix_guarantee_guide",
    language: { code: "pt_BR" }
  }
}
```

## Monitoramento

### Verificar Envios

Query no Supabase:
```sql
SELECT * FROM whatsapp_messages 
WHERE message_type = 'GARANTIA'
ORDER BY sent_at DESC
LIMIT 20;
```

### Verificar Failures

```sql
SELECT * FROM whatsapp_messages 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## Troubleshooting

### "WhatsApp API not configured"
- Verificar se as secrets estão configuradas no Supabase
- Usar `supabase secrets list` para confirmar

### "Não recebe mensagem no WhatsApp"
- Verificar se o número está no formato E.164 (+55...)
- Confirmar que o cliente existe no banco com número válido
- Testar manualmente via API do WhatsApp

### "API retorna erro 404"
- Confirmar URL da API
- Verificar se token está correto
- Verificar se phone_number_id está correto

## Próximas Melhorias

- [ ] Suporte a múltiplas templates WhatsApp
- [ ] Envio agendado de lembretes
- [ ] Dashboard de delivery de mensagens
- [ ] Integração com mais provedores WhatsApp
- [ ] QR Code para portal do cliente na mensagem
