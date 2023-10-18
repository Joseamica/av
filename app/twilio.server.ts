import { Twilio } from 'twilio'

export async function sendWaNotification({ from = '14155238886', to, body }: { from?: string; to: string[] | string; body: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    console.error('Twilio environment variables are not set.')
    return
  }

  if (!from || (!Array.isArray(to) && !to) || !body) {
    console.error('Invalid arguments provided.')
    return
  }

  // Remove non-numeric characters
  to = Array.isArray(to) ? to : [to]
  to = to.map(phone => phone.replace(/\D/g, ''))

  const client = new Twilio(accountSid, authToken)

  const promises = to.map(phone => {
    return client.messages
      .create({
        body,
        // from: `whatsapp:${from}`,
        // to: `whatsapp:+${phone}`,
        // body: 'Test',
        from: '+18149149288',
        to: '+' + phone,
      })
      .catch(error => {
        console.error(`Error sending WhatsApp message to +${phone}:`, error)
      })
  })

  try {
    await Promise.all(promises)
  } catch (error) {
    console.error('One or more messages could not be sent:', error)
  }
}
