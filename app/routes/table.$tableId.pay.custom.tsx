import { Form, useActionData, useLoaderData } from '@remix-run/react'
import React from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { validateRedirect } from '~/redirect.server'

import { getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getOrder } from '~/models/order.server'
import { validateCustom } from '~/models/validations.server'

import { getAmountLeftToPay, getCurrency } from '~/utils'
import { handlePaymentProcessing } from '~/utils/payment-processing.server'

import { Spacer } from '~/components'
import { Modal } from '~/components/modal'
import { PaymentV2 } from '~/components/payment/payment'

export default function CustomPay() {
  const data = useLoaderData()
  const actionData = useActionData()
  const [amountToPay, setAmountToPay] = React.useState(0)

  //todo translate cash,card, a espanol

  const handleAmountChange = e => {
    setAmountToPay(Number(e.target.value))
  }

  return (
    <Modal onClose={() => null} fullScreen={false} title="Pagar un monto personalizado">
      {actionData?.status === 400 && <div>Error message here</div>}

      <Form method="POST" preventScrollReset>
        <div className="bg-componentBg dark:bg-DARK_0 flex w-full flex-row items-center px-4 py-2  ">
          <label htmlFor="custom" className={clsx('bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]')}>
            {data.currency}
          </label>
          <input
            type="number"
            name="amountToPay"
            min="0"
            id="custom"
            inputMode="decimal"
            onChange={handleAmountChange} // Handle input changes
            className={clsx(`dark:bg-DARK-0 flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0`, {
              'animate-pulse placeholder:text-warning': actionData?.amountToPay,
            })}
            placeholder="0.00"
          />
        </div>

        <Spacer spaceY="1" />

        <PaymentV2
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

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const currency = await getCurrency(tableId)
  const amountLeft = await getAmountLeftToPay(tableId)

  return json({ paymentMethods, tipsPercentages, currency, amountLeft })
}

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
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

  const [order, branchId] = await Promise.all([getOrder(tableId), getBranchId(tableId)])

  invariant(order, 'No se encontró orden')
  invariant(branchId, 'No se encontró sucursal')

  const amountLeft = await getAmountLeftToPay(tableId)
  const menuCurrency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')

  const tip = Number(total) * (Number(data.tipPercentage) / 100)

  if (amountLeft && amountLeft < Number(total)) {
    const url = new URL(request.url)
    const pathname = url.pathname
    return redirect(`/table/${tableId}/pay/confirmExtra?total=${total}&tip=${tip <= 0 ? total * 0.12 : tip}&pMethod=${data.paymentMethod}&redirectTo=${pathname}`)
  }

  const isOrderAmountFullPaid = amountLeft <= total

  // ANCHOR Stripe component
  const result = await handlePaymentProcessing(data.paymentMethod as string, total, tip, menuCurrency, isOrderAmountFullPaid, request, redirectTo, 'custom')

  if (result.type === 'redirect') {
    return redirect(result.url)
  }

  return json({ status: 400, error: result.message })
}
