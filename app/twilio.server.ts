import { Twilio } from "twilio";

export function SendWhatsApp(
  from: string,
  to: string[] | string,
  body: string
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = new Twilio(accountSid, authToken);
  if (!Array.isArray(to)) to = [to];

  const promises = to.map((phone) => {
    return client.messages.create({
      body: body,
      from: `whatsapp:${from}`,
      // from: `whatsapp:+14155238886`,
      to: `whatsapp:${phone}`,
    });
  });

  Promise.all(promises)
    .then((messages) => {
      messages.forEach((message) => console.log(message.sid));
    })
    .catch((error) => {
      console.error("Error sending WhatsApp messages:", error);
      throw error;
    });
}
