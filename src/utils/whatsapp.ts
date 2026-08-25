/**
 * WhatsApp Integration Utilities
 * Handles sending documents and messages via WhatsApp API
 */

import { supabase } from '../lib/supabase';

// Fenix Guide PDF - Store this in your Cloudinary or public storage
const FENIX_GUIDE_PDF_URL = import.meta.env.VITE_FENIX_GUIDE_PDF_URL || 
  'https://res.cloudinary.com/dglgtgahp/raw/upload/v1782826917/warranties/iiv55b8usesggjg1lewd.pdf';

// Link direto para avaliação no Google
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJU47Uhnurz5QRbBUNKIJR62o';

export interface WhatsAppMessage {
  phone: string;
  message: string;
  documentUrl?: string;
  documentName?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send WhatsApp message via Supabase Function
 */
export async function sendWhatsAppMessage(
  params: WhatsAppMessage
): Promise<WhatsAppResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        phone: params.phone,
        message: params.message,
        documentUrl: params.documentUrl,
        documentName: params.documentName,
      },
    });

    if (error) {
      console.error('WhatsApp API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Send Fenix Guarantee Guide PDF to customer after delivery
 */
export async function sendFenixGuideAfterDelivery(
  deliveryId: string,
  customerPhone: string,
  customerName: string,
  equipmentName: string
): Promise<WhatsAppResponse> {
  const message = `Olá ${customerName}! 👋\n\nSua entrega foi finalizada com sucesso! ✅\n\nAnexo, você encontra o guia completo de cuidados essenciais para manter a garantia do seu equipamento ${equipmentName} ativa.\n\n🛡️ *Garantia Fenix Brasil - 90 dias*\n\nQualquer dúvida, estamos à disposição!\n\n⭐ *Sua opinião vale muito!*\nLeva menos de 1 minuto — avalie nosso serviço no Google:\n${GOOGLE_REVIEW_URL}\n\nAtenciosamente,\nFenix Brasil 🚀`;

  return sendWhatsAppMessage({
    phone: customerPhone,
    message,
    documentUrl: FENIX_GUIDE_PDF_URL,
    documentName: 'Fenix_Guia_Garantia.pdf',
  });
}

/**
 * Log WhatsApp message in database
 */
export async function logWhatsAppMessage(
  deliveryId: string,
  customerId: string,
  phone: string,
  messageType: 'ENTREGA' | 'GARANTIA' | 'FEEDBACK' | 'LEMBRETE',
  messageContent: string,
  status: 'pending' | 'sent' | 'delivered' | 'failed'
) {
  try {
    const { error } = await supabase.from('whatsapp_messages').insert({
      delivery_id: deliveryId,
      customer_id: customerId,
      phone,
      message_type: messageType,
      message_content: messageContent,
      status,
      sent_at: status === 'sent' || status === 'delivered' ? new Date().toISOString() : null,
    });

    if (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  } catch (err) {
    console.error('Failed to log WhatsApp message:', err);
  }
}

/**
 * Get customer phone number from database
 */
export async function getCustomerPhone(customerId: string): Promise<string | null> {
  if (!customerId || customerId === 'null') {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('phone')
      .eq('id', customerId)
      .maybeSingle();

    return data?.phone || null;
  } catch (err) {
    console.error('Failed to get customer phone:', err);
    return null;
  }
}

/**
 * Build direct WhatsApp Web / App URL with pre-filled message (Google review + PDF guide)
 */
export function buildWhatsAppDirectUrl(
  phone: string,
  customerName?: string,
  equipmentOrOrder?: string
): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const clientName = customerName?.trim() || 'Cliente';
  const itemDesc = equipmentOrOrder?.trim() || '';

  const message = `Olá ${clientName}! 👋\n\nSua entrega ${itemDesc ? `(${itemDesc}) ` : ''}foi finalizada com sucesso! ✅\n\n📄 *Guia de Cuidados e Garantia (90 dias):*\n${FENIX_GUIDE_PDF_URL}\n\n⭐ *Sua opinião vale muito para nós!*\nPoderia avaliar nosso atendimento no Google? Leva menos de 1 minuto no celular:\n${GOOGLE_REVIEW_URL}\n\nMuito obrigado pela confiança!\n*Fenix Brasil* 🚀`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp directly in browser / app with pre-filled message
 */
export function openWhatsAppDirect(
  phone: string,
  customerName?: string,
  equipmentOrOrder?: string
): boolean {
  const url = buildWhatsAppDirectUrl(phone, customerName, equipmentOrOrder);
  if (!url) return false;
  window.open(url, '_blank');
  return true;
}
