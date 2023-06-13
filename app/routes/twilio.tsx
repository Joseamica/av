import {ActionArgs, LoaderArgs, redirect} from '@remix-run/node'
import {Form} from '@remix-run/react'
import {json} from '@remix-run/node'
import {Twilio} from 'twilio'
import {sendWhatsapp} from '~/twilio.server'

export async function action({request}: ActionArgs) {
  const formData = await request.formData()

  const sendNotification = sendWhatsapp(
    '14155238886',
    '5215512956265',
    'test a sumi, si te llega te amo<3',
  )

  return json({message: 'ok'})
}

export default function twilio() {
  return (
    <Form method="post">
      <button>a</button>
    </Form>
  )
}
