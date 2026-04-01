import twilio from "twilio";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeWhatsAppNumber(number) {
  if (!number) return "";
  return String(number).startsWith("whatsapp:")
    ? String(number)
    : `whatsapp:${number}`;
}

export async function sendWhatsAppMessage({ body, to }) {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  const from = normalizeWhatsAppNumber(requireEnv("TWILIO_WHATSAPP_FROM"));
  const destination = normalizeWhatsAppNumber(
    to || process.env.CAREGIVER_WHATSAPP_TO
  );

  if (!destination) {
    throw new Error(
      "Missing caregiver number. Set CAREGIVER_WHATSAPP_TO or pass 'to' in the request body."
    );
  }

  const client = twilio(accountSid, authToken);

  const response = await client.messages.create({
    from,
    to: destination,
    body,
  });

  return {
    sid: response.sid,
    status: response.status,
    to: destination,
    from,
  };
}
