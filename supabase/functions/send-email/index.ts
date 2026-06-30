import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This variable will hold the base64 encoded PDF embedded at build/deploy time
const LOCAL_PDF_BASE64 = "";

interface SendEmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  pdfUrl?: string;
  pdfName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlContent, pdfUrl, pdfName } =
      (await req.json()) as SendEmailRequest;

    // Validate required fields
    if (!to || !subject || !htmlContent) {
      return new Response(
        JSON.stringify({
          error: "to, subject, and htmlContent are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("SENDER_EMAIL") || "noreply@shoppingdasacademias.com.br";

    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Download PDF if URL provided, fallback to local bundle PDF
    let attachment = null;
    if (pdfUrl && pdfName) {
      try {
        const pdfResponse = await fetch(pdfUrl);
        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
          attachment = {
            filename: pdfName,
            content: base64Pdf,
            contentType: "application/pdf",
          };
        }
      } catch (err) {
        console.warn("Failed to download PDF, trying local fallback:", err);
      }
    }

    if (!attachment && LOCAL_PDF_BASE64) {
      attachment = {
        filename: pdfName || "Não perca sua garantia.pdf",
        content: LOCAL_PDF_BASE64,
        contentType: "application/pdf",
      };
    }

    // Prepare email payload for Resend
    const emailPayload: any = {
      from: senderEmail,
      to,
      subject,
      html: htmlContent,
    };

    if (attachment) {
      emailPayload.attachments = [attachment];
    }

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Failed to send email",
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
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
