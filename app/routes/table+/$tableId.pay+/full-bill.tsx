import { Form, useNavigate } from '@remix-run/react'

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { PaymentMethod } from '@prisma/client'
import invariant from 'tiny-invariant'
import { validateRedirect } from '~/redirect.server'
import { getSession } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { getBranch, getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getOrder } from '~/models/order.server'
import { getPaidUsers } from '~/models/user.server'
import { validateFullPay } from '~/models/validations.server'

import { getAmountLeftToPay, getCurrency } from '~/utils'
import { handlePaymentProcessing } from '~/utils/payment-processing.server'

import { BillAmount, Spacer } from '~/components'
import { Modal } from '~/components/modal'
import Payment from '~/components/payment/paymentV3'

type LoaderData = {
  amountLeft: number
  total: number
  tableId: string
  paidUsers: any
  currency: string
  tipsPercentages: number[]
  paymentMethods: string[]
  userId: string
}

// ANCHOR LOADER
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')
  const amountLeft = await getAmountLeftToPay(tableId)
  const order = await getOrder(tableId)
  const total = order?.total

  const session = await getSession(request)
  const userId = session.get('userId')

  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  let paidUsers = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
  }

  const currency = await getCurrency(tableId)

  const language = (await getBranch(tableId)).language

  // const currency = getCurrency(menu?.currency)

  const data = {
    amountLeft,
    total,
    tableId,
    paidUsers,
    currency,
    tipsPercentages,
    paymentMethods,
    userId,
    language,
  }

  return json(data)
}

// ANCHOR ACTION
export async function action({ request, params }: ActionFunctionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId no encontrado')
  const branchId = await getBranchId(tableId)

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden')
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  try {
    validateFullPay(data)
  } catch (error) {
    console.log('error', error)
    return error
  }
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const tipPercentage = formData.get('tipPercentage') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const menuCurrency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')
  //FIX this \/
  //@ts-expect-error
  const tip = amountLeft * Number(tipPercentage / 100)

  const result = await handlePaymentProcessing({
    paymentMethod: paymentMethod as string,
    total: amountLeft,
    tip,
    currency: menuCurrency,
    isOrderAmountFullPaid: true,
    request,
    redirectTo,
    typeOfPayment: 'full-bill',
    extraData: { branchId, tableId, order },
  })

  if (result.type === 'redirect') {
    return redirect(result.url)
  }

  return json({ success: true })
}

export default function FullPay() {
  const data = useLiveLoader<LoaderData>()
  const navigate = useNavigate()

  return (
    <Modal onClose={() => navigate('..')} title="Pagar cuenta completa">
      <Payment
        state={{
          amountLeft: data.amountLeft,
          amountToPayState: data.total,
          currency: data.currency,
          paymentMethods: data.paymentMethods,
          tipsPercentages: data.tipsPercentages,
        }}
      >
        <div>
          <BillAmount
            amountLeft={data.amountLeft}
            currency={data.currency}
            paidUsers={data.paidUsers}
            total={data.total}
            userId={data.userId}
          />
          <Spacer spaceY="2" />
          <Form method="POST" preventScrollReset>
            <Payment.Form />
          </Form>
        </div>
      </Payment>
    </Modal>
  )
}
