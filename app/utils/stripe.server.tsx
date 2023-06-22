import type {Branch, PaymentMethod, User} from '@prisma/client'
import initStripe from 'stripe'

// copied from (https://github.com/kentcdodds/kentcdodds.com/blob/ebb36d82009685e14da3d4b5d0ce4d577ed09c63/app/utils/misc.tsx#L229-L237)
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export const getStripeSession = async (
  amount: number, // Amount in cents (or the smallest currency unit)
  domainUrl: string,
  sseURL: string,
  currency: string = 'usd', // Default to USD
  tip: number,
  orderId: string,
  paymentMethod: PaymentMethod,
  userId: User['id'],
  branchId: Branch['id'],
  typeOfPayment?: string,
): Promise<string> => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY)
  const lineItems = [
    {
      price_data: {
        currency: currency,
        product_data: {
          name: 'Tu cuenta',
          // Add more product data if needed
        },
        unit_amount: amount,
      },
      quantity: 1,
    },
  ]
  // switch (typeOfPayment){
  //   case: "perDish":
  // }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: {
      tip,
      orderId,
      paymentMethod,
      userId,
      branchId,
      sseURL,
      typeOfPayment,
    },
    success_url: `${domainUrl}/loader/processPay?paymentSuccess=true&typeOfPayment=${typeOfPayment}`,
    cancel_url: `${domainUrl}/loader/processPay?paymentSuccess=false&typeOfPayment=${typeOfPayment}`,
  })
  console.log('session', session)
  return session.url
}
