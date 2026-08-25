/**
 * Email Integration Utilities
 * Handles sending emails with PDF attachments via Resend API
 */

import { supabase } from '../lib/supabase';

// PDF URL from Cloudinary - Fenix Guarantee Guide
const FENIX_GUIDE_PDF_URL = import.meta.env.VITE_FENIX_GUIDE_PDF_URL || 
  'https://res.cloudinary.com/dglgtgahp/raw/upload/v1787668355/warranties/guia-de-garantia-fenix';

// Link direto para avaliação no Google
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJU47Uhnurz5QRbBUNKIJR62o';

export interface EmailMessage {
  to: string;
  subject: string;
  htmlContent: string;
  pdfUrl?: string;
  pdfName?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Supabase Function
 */
export async function sendEmail(
  params: EmailMessage
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
        pdfUrl: params.pdfUrl,
        pdfName: params.pdfName,
      },
    });

    if (error) {
      console.error('Email API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Send Fenix Guarantee Guide PDF to customer after delivery
 */
export async function sendFenixGuideEmailAfterDelivery(
  deliveryId: string,
  customerEmail: string,
  customerName: string,
  equipmentName: string
): Promise<EmailResponse> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c41e3a 0%, #8b1528 100%); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; font-size: 14px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .cta-button { display: inline-block; background: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px; }
          .highlight { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
          ul { margin: 15px 0; padding-left: 25px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Sua Entrega foi Finalizada!</h1>
            <p>Equipamento: ${equipmentName}</p>
          </div>

          <div class="content">
            <p>Olá <strong>${customerName}</strong>! 👋</p>
            
            <p>Agradecemos pela sua confiança! Sua entrega foi concluída com sucesso. 🎉</p>

            <div class="highlight">
              <strong>🛡️ Garantia Fenix Brasil - 90 dias</strong>
              <p>Sua garantia já está ativa! Para mantê-la válida, é fundamental seguir os cuidados essenciais com seu equipamento.</p>
            </div>

            <h3>📎 Documento Anexado</h3>
            <p>Em anexo a este email, você encontrará o <strong>Guia Completo de Cuidados</strong> com todas as informações necessárias para:</p>
            <ul>
              <li>✓ Manter a garantia do seu equipamento ativa</li>
              <li>✓ Garantir o funcionamento perfeito do seu investimento</li>
              <li>✓ Evitar problemas comuns de manutenção</li>
              <li>✓ Proteger a saúde do seu negócio</li>
            </ul>

            <h3>📋 Tópicos Abordados no Guia</h3>
            <ul>
              <li>Instalação Elétrica Correta</li>
              <li>Lubrificação e Manutenção</li>
              <li>Limpeza Adequada dos Equipamentos</li>
              <li>Cuidados com o Painel de Controle</li>
              <li>Manutenção Preventiva</li>
            </ul>

            <p style="margin-top: 20px; font-size: 14px;">
              <strong>💡 Dica:</strong> Recomendamos imprimir e manter o guia próximo aos seus equipamentos para fácil acesso.
            </p>

            <h3>❓ Dúvidas?</h3>
            <p>Nosso suporte técnico especializado está sempre à disposição para ajudá-lo!</p>
            <p><strong>Telefone:</strong> (97) 3612-175</p>

            <div style="margin-top: 30px; padding: 20px; background: #fff8e1; border-radius: 10px; border: 2px solid #ffc107; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #333;">⭐ Sua opinião vale muito para nós!</p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #666;">Leva menos de 1 minuto e ajuda muito nosso negócio.</p>
              <a href="${GOOGLE_REVIEW_URL}" style="display: inline-block; background: #4285F4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                🌟 Avaliar no Google
              </a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Fenix Brasil - Shopping das Academias</strong></p>
            <p>Seu negócio saudável é nossa missão!</p>
            <p>
              📱 <a href="https://instagram.com/shopdasacademias" style="color: #c41e3a;">@shopdasacademias</a> | 
              🌐 <a href="https://www.shoppingdasacademias.com.br" style="color: #c41e3a;">www.shoppingdasacademias.com.br</a>
            </p>
            <p style="margin-top: 15px; color: #999;">
              Esta é uma mensagem automática. Por favor, não responda este email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `✅ Guia de Garantia - Equipamento ${equipmentName}`,
    htmlContent,
    pdfUrl: FENIX_GUIDE_PDF_URL,
    pdfName: 'Fenix_Guia_Garantia_Cuidados_Essenciais.pdf',
  });
}

/**
 * Log email in database
 */
export async function logEmailMessage(
  deliveryId: string,
  customerId: string,
  email: string,
  subject: string,
  status: 'pending' | 'sent' | 'failed'
) {
  try {
    // Insert into a generic message log or create emails table
    const { error } = await supabase.from('email_messages').insert({
      delivery_id: deliveryId,
      customer_id: customerId,
      email,
      subject,
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });

    if (error) {
      console.error('Error logging email message:', error);
    }
  } catch (err) {
    console.error('Failed to log email message:', err);
  }
}

/**
 * Get customer email from database
 * Tries multiple sources: customers table, expeditions table
 */
export async function getCustomerEmail(
  customerId?: string,
  expeditionId?: string
): Promise<string | null> {
  try {
    // First try customers table
    if (customerId && customerId !== 'null') {
      const { data, error } = await supabase
        .from('customers')
        .select('email')
        .eq('id', customerId)
        .maybeSingle();

      if (!error && data?.email) {
        return data.email;
      }
    }

    // Fallback to expeditions table
    if (expeditionId && expeditionId !== 'null') {
      const { data, error } = await supabase
        .from('expeditions')
        .select('client_email')
        .eq('id', expeditionId)
        .maybeSingle();

      if (!error && data?.client_email) {
        return data.client_email;
      }
    }

    return null;
  } catch (err) {
    console.error('Failed to get customer email:', err);
    return null;
  }
}
