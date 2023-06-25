import {ActionArgs, LoaderArgs, json, redirect} from '@remix-run/node'
import {Form, useActionData, useLoaderData, useNavigate} from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import invariant from 'tiny-invariant'
import {Spacer} from '~/components'
import {Modal} from '~/components/modal'
import {P} from '~/components/payment'
import {EVENTS} from '~/events'
import useSessionTimeout from '~/hooks/use-session-timeout'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getOrder} from '~/models/order.server'
import {createPayment} from '~/models/payments.server'
import {assignUserNewPayments} from '~/models/user.server'
import {validateCustom} from '~/models/validations.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'
import {getDomainUrl, getStripeSession} from '~/utils/stripe.server'

const variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: {duration: 0.2},
      height: {duration: 0.4},
    },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
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

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const total = Number(formData.get('amountToPay')) as number

  //VALIDATIONS
  try {
    validateCustom(data)
  } catch (error) {
    console.log('error', error)
    return error
  }

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const [order, branchId] = await Promise.all([
    getOrder(tableId),
    getBranchId(tableId),
  ])
  invariant(order, 'No se encontró orden')
  invariant(branchId, 'No se encontró sucursal')

  const [amountLeft, currency, username] = await Promise.all([
    getAmountLeftToPay(tableId),
    getCurrency(tableId),
    getUsername(request),
  ])

  const tip = Number(total) * (Number(data.tipPercentage) / 100)

  if (amountLeft && amountLeft < Number(total)) {
    return redirect(
      `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
        tip <= 0 ? total * 0.12 : tip
      }&pMethod=${data.paymentMethod}`,
    )
  }
  const userId = await getUserId(request)

  switch (data.paymentMethod) {
    case 'card':
      try {
        const stripeRedirectUrl = await getStripeSession(
          total * 100 + tip * 100,
          getDomainUrl(request),
          tableId,
          'eur',
          tip,
          order.id,
          data.paymentMethod,
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
        data.paymentMethod,
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
        `El usuario ${username} ha pagado quiere pagar en efectivo propina ${tip} y total ${total}`,
      )
      EVENTS.ISSUE_CHANGED(tableId, `userPaid ${username}`)
      return redirect(redirectTo)
  }

  return json({success: true})
}

export default function CustomPay() {
  useSessionTimeout()
  const data = useLoaderData()
  const actionData = useActionData()
  const [amountToPay, setAmountToPay] = React.useState(0)

  //todo translate cash,card, a espanol

  // Handle input changes
  const handleAmountChange = e => {
    setAmountToPay(Number(e.target.value))
  }

  const navigate = useNavigate()

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={false}
      title="Pagar un monto personalizado"
    >
      <Form method="POST" preventScrollReset>
        <div className="bg-componentBg dark:bg-DARK_0 flex w-full flex-row items-center px-4 py-2  ">
          <label
            htmlFor="custom"
            className={clsx(
              'bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]',
            )}
          >
            {data.currency}
          </label>
          <input
            type="number"
            name="amountToPay"
            min="0"
            id="custom"
            inputMode="decimal"
            onChange={handleAmountChange} // Handle input changes
            className={clsx(
              `dark:bg-DARK-0 flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0`,
              {
                ' animate-pulse placeholder:text-warning':
                  actionData?.amountToPay,
              },
            )}
            // defaultValue={userTotal ? userTotal : ''}
            placeholder="0.00"
          />
        </div>
        <Spacer spaceY="1" />
        <P
          amountLeft={data.amountLeft}
          amountToPayState={amountToPay}
          currency={data.currency}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
        />
      </Form>
    </Modal>
  )
}
