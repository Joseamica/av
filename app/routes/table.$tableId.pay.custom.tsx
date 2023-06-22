import {PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import {Twilio} from 'twilio'
import {H5, Payment} from '~/components'
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
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  if (!proceed && tipPercentage && total <= 0) {
    return json(
      {error: 'Antes de asignar propina, ingresa un monto por pagar'},
      {status: 400},
    )
  }

  if (proceed && total <= 0) {
    return json({error: 'El monto a pagar debe ser mayor a 0 '}, {status: 400})
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

  return json({paymentMethods, tipsPercentages, currency})
}

export default function Custom() {
  const navigate = useNavigate()

  const data = useLiveLoader<typeof loader>()
  const actionData = useActionData()

  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={false}
      title="Dividir en partes iguales"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
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
        <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
          error={actionData?.error}
        />
      </Form>
    </Modal>
  )
}
