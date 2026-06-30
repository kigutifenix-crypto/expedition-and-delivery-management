import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendWhatsAppRequest {
  phone: string;
  message: string;
  documentUrl?: string;
  documentName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, message, documentUrl, documentName } = (await req.json()) as SendWhatsAppRequest;

    // Validate required fields
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get WhatsApp API credentials from environment
    const whatsappApiUrl = Deno.env.get("WHATSAPP_API_URL");
    const whatsappApiToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!whatsappApiUrl || !whatsappApiToken || !whatsappPhoneNumberId) {
      console.error("Missing WhatsApp API configuration");
      return new Response(
        JSON.stringify({ error: "WhatsApp API not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format phone number (remove special characters, ensure E.164 format)
    const formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55")) {
      // Add Brazil country code if missing
      const phoneWithCountry = "55" + formattedPhone;
      return sendWhatsAppMessage(
        phoneWithCountry,
        message,
        documentUrl,
        documentName,
        whatsappApiUrl,
        whatsappApiToken,
        whatsappPhoneNumberId
      );
    }

    return sendWhatsAppMessage(
      formattedPhone,
      message,
      documentUrl,
      documentName,
      whatsappApiUrl,
      whatsappApiToken,
      whatsappPhoneNumberId
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function sendWhatsAppMessage(
  phone: string,
  message: string,
  documentUrl: string | undefined,
  documentName: string | undefined,
  apiUrl: string,
  apiToken: string,
  phoneNumberId: string
) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  try {
    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: "fenix_guarantee_guide",
        language: {
          code: "pt_BR",
        },
      },
    };

    // If document is provided, send it as well
    if (documentUrl && documentName) {
      // Send text message first
      await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "text",
          text: {
            preview_url: true,
            body: message,
          },
        }),
      });

      // Then send document
      const documentResponse = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "document",
          document: {
            link: documentUrl,
            filename: documentName,
          },
        }),
      });

      if (!documentResponse.ok) {
        const error = await documentResponse.json();
        throw new Error(`Failed to send document: ${JSON.stringify(error)}`);
      }

      const docData = await documentResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          messageId: docData?.messages?.[0]?.id,
          type: "document_sent",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send text message only
    const response = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data?.messages?.[0]?.id,
        type: "text_sent",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
