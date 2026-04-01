import {
  buildWhatsAppReportData,
  formatWhatsAppReport,
} from "@/lib/whatsappReport";
import { sendWhatsAppMessage } from "@/lib/twilioWhatsApp";

export async function POST(request) {
  try {
    const requestBody = await request.json().catch(() => ({}));

    console.log("[WhatsApp API] Incoming request:", requestBody);

    const reportData = buildWhatsAppReportData(requestBody);
    const message = formatWhatsAppReport(reportData);

    console.log("[WhatsApp API] Formatted message:\n", message);

    const twilioResult = await sendWhatsAppMessage({
      body: message,
      to: requestBody.caregiverPhone,
    });

    console.log("[WhatsApp API] Message sent:", twilioResult);

    return Response.json(
      {
        ok: true,
        message: "WhatsApp report sent successfully.",
        twilio: twilioResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WhatsApp API] Failed to send report:", error);

    return Response.json(
      {
        ok: false,
        message: "Failed to send WhatsApp report.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
