import {LoaderArgs, json} from '@remix-run/node'
import Stripe from 'stripe'
import {getSession} from '~/session.server'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  const url = new URL(request.url)
  const paymentSuccess = url.searchParams.get('paymentSuccess')
  const typeOfPayment = url.searchParams.get('typeOfPayment')
  const session = await getSession(request)

  if (paymentSuccess === 'true') {
    switch (typeOfPayment) {
      case 'perUser': {
        break
      }
    }
  }

  return json({success: true})
}
