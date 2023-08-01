// PaymentProcessing.js

import {createQueryString} from '~/utils'
import {getDomainUrl, getStripeSession} from './stripe.server'

export async function handlePaymentProcessing(
  paymentMethod: string,
  total: number,
  tip: number,
  currency: string,
  isOrderAmountFullPaid: boolean,
  request: Request,
  redirectTo: string,
  typeOfPayment: string,
  extraData?: any,
): Promise<{type: 'redirect'; url: string} | {type: 'error'; message: string}> {
  switch (paymentMethod) {
    case 'card':
      try {
        const stripeRedirectUrl = await getStripeSession(
          total * 100 + tip * 100,
          isOrderAmountFullPaid,
          getDomainUrl(request) + redirectTo,
          currency,
          tip,
          paymentMethod,
          'custom',
          extraData,
        )
        return {type: 'redirect', url: stripeRedirectUrl}
      } catch (error) {
        console.error('Failed to create payment session:', error)
        return {type: 'redirect', url: '/error'}
      }
    case 'cash':
      const params = {
        typeOfPayment,
        amount: total + tip,
        tip: tip,
        paymentMethod: paymentMethod,
        isOrderAmountFullPaid: isOrderAmountFullPaid,
      }
      const queryString = createQueryString(params)
      return {
        type: 'redirect',
        url: `${redirectTo}/payment/success?${queryString}`,
      }
  }
  return {type: 'error', message: `Unknown payment method: ${paymentMethod}`}
}
