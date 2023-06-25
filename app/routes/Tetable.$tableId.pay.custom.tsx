import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import React, {useEffect, useState} from 'react'
import invariant from 'tiny-invariant'
import {Twilio} from 'twilio'
import {Button, FlexRow, H3, H5, Payment} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {createPayment} from '~/models/payments.server'
import {assignUserNewPayments} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {getStripeSession, getDomainUrl} from '~/utils/stripe.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()
  const userName = await getUsername(request)

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const total = Number(formData.get('amountToPay')) as number
  const tipPercentage = formData.get('tipPercentage') as string
  const paymentMethod = formData.get('paymentMethod')

  console.log('total', total)
  console.log('tipPercentage', tipPercentage)
  console.log('paymentMethod', paymentMethod)

  if (!proceed && tipPercentage && total <= 0) {
    return json(
      {error: 'Antes de asignar propina, ingresa un monto por pagar'},
      {status: 400},
    )
  }

  if (proceed && total <= 0) {
    console.log('regresando...')
    return json({error: 'El monto a pagar debe ser mayor a 0 '})
  }

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  const branchId = await getBranchId(tableId)

  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')

  const tip = Number(total) * (Number(tipPercentage) / 100)
  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const currency = await getCurrency(tableId)

  let error = ''
  if (amountLeft < Number(total)) {
    error = `Estas pagando ${formatCurrency(
      currency,
      total - amountLeft,
    )} de más....`
  }

  if (proceed) {
    //WHEN SUBMIT
    if (amountLeft < total) {
      return redirect(
        `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
          tip <= 0 ? total * 0.12 : tip
        }&pMethod=${paymentMethod}`,
      )
    }

    const userId = await getUserId(request)

    switch (paymentMethod) {
      case 'card':
        try {
          const stripeRedirectUrl = await getStripeSession(
            total * 100 + tip * 100,
            getDomainUrl(request),
            tableId,
            'eur',
            tip,
            order.id,
            paymentMethod,
            userId,
            branchId,
            'custom',
            {tip},
          )

          return redirect(stripeRedirectUrl)
        } catch (error) {
          console.error('Failed to create payment session:', error)
          return redirect('/error')
        }

      case 'cash':
        await createPayment(
          paymentMethod,
          total,
          tip,
          order.id,
          userId,
          branchId,
        )
        await assignUserNewPayments(userId, total, tip)

        SendWhatsApp(
          '14155238886',
          `5215512956265`,
          `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${total}`,
        )
        break
    }

    // Add other payment methods similarly

    // Update user's payment records in the database, this will run regardless of the payment method

    EVENTS.ISSUE_CHANGED(tableId, `userPaid ${userName}`)
    return redirect(redirectTo)
  }

  return json({total, tip, error})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const currency = await getCurrency(tableId)
  const amountLeft = await getAmountLeftToPay(tableId)

  return json({paymentMethods, tipsPercentages, currency, amountLeft})
}

export default function Custom() {
  const navigate = useNavigate()

  // const data = useLiveLoader<typeof loader>()
  const data = useLoaderData()
  const actionData = useActionData()
  console.log('actionData', actionData)
  const fetcher = useFetcher()
  const [pay, setPay] = useState(false)
  console.log('fetcher', fetcher)

  if (fetcher.submission) {
    console.log('fetcher', fetcher)
    console.log('fetcher', fetcher.submission?.formData.get('paymentMethod'))
  }

  // useEffect(() => {
  //   if (fetcher.submission) {
  //     const formData = fetcher.submission.formData
  //     const paymentMethod = formData.get('paymentMethod') as string
  //     const total = Number(formData.get('amountToPay')) as number
  //     const tipPercentage = formData.get('tipPercentage') as string
  //     const tip = Number(total) * (Number(tipPercentage) / 100)
  //     const amountLeft = (data.amountLeft || 0) - total
  //     const currency = data.currency

  //     if (paymentMethod && tipPercentage && total > 0) {
  //       setPay(true)
  //       return
  //     }
  //   }
  // }, [fetcher.submission])
  const submit = useSubmit()
  // function handleChange(event: React.FormEvent<HTMLFormElement>) {
  //   submit(event.currentTarget, {replace: true})
  // }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={false}
      title="Pagar un monto personalizado"
    >
      <fetcher.Form method="POST" preventScrollReset>
        <div className="bg-componentBg dark:bg-DARK_0 flex w-full flex-row items-center px-4 py-2 ">
          <label
            htmlFor="custom"
            className="bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]"
          >
            {data.currency}
          </label>
          <input
            type="number"
            name="amountToPay"
            min="0"
            id="custom"
            inputMode="decimal"
            // onChange={e => setAmount(Number(e.target.value))}
            className="dark:bg-DARK-0 flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 "
            // defaultValue={userTotal ? userTotal : ''}
            placeholder="0.00"
          />
        </div>
        <FlexRow>
          <H3>Queda Por pagar</H3>
          <H3>{formatCurrency(data.currency, data.amountLeft)}</H3>
        </FlexRow>
        <FlexRow>
          {Object.values(data.paymentMethods).map(
            (paymentMethod: PaymentMethod) => (
              <label key={paymentMethod}>
                {paymentMethod}
                <input
                  type="radio"
                  name="paymentMethod"
                  value={paymentMethod}
                  className="bg-componentBg dark:bg-DARK-0 dark:text-mainTextDark text-2xl text-[#9CA3AF]"
                />
              </label>
            ),
          )}
        </FlexRow>

        {Object.values(data.tipsPercentages).map((tipsPercentage: any) => (
          <label key={tipsPercentage}>
            {tipsPercentage}
            <input
              type="radio"
              name="tipsPercentage"
              value={tipsPercentage}
              className="bg-componentBg dark:bg-DARK-0 dark:text-mainTextDark text-2xl text-[#9CA3AF]"
            />
          </label>
        ))}
        {/* <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
          error={actionData?.error}
          amountLeft={data.amountLeft}
        /> */}
        {actionData?.error && (
          <div className="text-center text-red-500">{actionData?.error}</div>
        )}
        <Button name="_action" value="proceed" fullWith={true}>
          Pagar{' '}
          {formatCurrency(
            data.currency,
            Number(actionData?.total || 0) + Number(actionData?.tip || 0),
          )}
        </Button>
      </fetcher.Form>
    </Modal>
  )
}
