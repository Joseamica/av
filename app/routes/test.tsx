import { Form, useLoaderData } from '@remix-run/react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { loadStripe } from '@stripe/stripe-js'

import { getStripeSession } from '~/utils/stripe.server'
import { getStripePayment } from '~/utils/stripeTest.server'

export async function loader({ request, params }: LoaderArgs) {
  const amount = 271
  const intent = await getStripePayment({ amount })
  const client_secret = intent.client_secret

  return json({ client_secret })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

const stripePromise = loadStripe('pk_test_XCv57wYNRXqzP7A5exFgiw4d005M9XPM6X')

export default function StripePayment() {
  const data = useLoaderData()
  const options = {
    clientSecret: data.client_secret,
  }
  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async event => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://localhost:3000/paymentstatus',
      },
    })

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message)
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }
  return (
    <Form onSubmit={handleSubmit} className="h-full">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name: 'Jenny Rosen',
              email: 'joseamica@gmai.com',
              phone: '4158675309',
            },
          },
        }}
      />
      <button disabled={!stripe}>Submit {errorMessage && <div>{errorMessage}</div>}</button>
    </Form>
  )
}
