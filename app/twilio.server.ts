import {Twilio} from 'twilio'

export function sendWhatsapp(from: string, to: string[], body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  const client = new Twilio(accountSid, authToken)

  const promises = to.map(id => {
    return client.messages.create({
      body: body,
      from: `whatsapp:${from}`,
      to: `whatsapp:${id}`,
    })
  })

  Promise.all(promises)
    .then(messages => {
      messages.forEach(message => console.log(message.sid))
    })
    .catch(error => {
      console.error('Error sending WhatsApp messages:', error)
      throw error
    })
}
