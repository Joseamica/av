import {PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import {AnimatePresence, motion} from 'framer-motion'
import React from 'react'
import invariant from 'tiny-invariant'
import {H5, Payment, QuantityManagerButton} from '~/components'
import {Modal} from '~/components/modal'
import {P} from '~/components/payment'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {assignExpirationAndValuesToOrder, getOrder} from '~/models/order.server'
import {createPayment} from '~/models/payments.server'
import {assignUserNewPayments} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {getDomainUrl, getStripeSession} from '~/utils/stripe.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()
  const branchId = await getBranchId(tableId)

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const tipPercentage = formData.get('tipPercentage') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')

  const total = order.total

  if (!total) {
    return json({error: 'No se ha seleccionado ningún platillo'}, {status: 400})
  }

  const payingTotal = Number(formData.get('payingTotal')) as number
  const tip = Number(payingTotal) * (Number(tipPercentage) / 100)
  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const userName = await getUsername(request)

  if (payingTotal > Number(amountLeft)) {
    const url = new URL(request.url)
    const pathname = url.pathname
    return redirect(
      `/table/${tableId}/pay/confirmExtra?total=${payingTotal}&tip=${
        tip <= 0 ? Number(payingTotal) * 0.12 : tip
      }&pMethod=${paymentMethod}&redirectTo=${pathname}`,
    )
  }
  const userId = await getUserId(request)

  const isOrderAmountFullPaid = amountLeft <= payingTotal

  // NOTE - esto va aqui porque si el metodo de pago es otro que no sea tarjeta, entonces que cree el pago directo, sin stripe (ya que stripe tiene su propio create payment en el webhook)
  if (paymentMethod === 'card') {
    const stripeRedirectUrl = await getStripeSession(
      payingTotal * 100 + tip * 100,
      isOrderAmountFullPaid,
      getDomainUrl(request),
      tableId,
      // FIX aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
      'eur',
      tip,
      order.id,
      paymentMethod,
      userId,
      branchId,
    )
    return redirect(stripeRedirectUrl)
  } else if (paymentMethod === 'cash') {
    await createPayment(
      paymentMethod,
      payingTotal,
      tip,
      order.id,
      userId,
      branchId,
    )
    await assignUserNewPayments(userId, payingTotal, tip)
    await assignExpirationAndValuesToOrder(amountLeft, tip, payingTotal, order)
    SendWhatsApp(
      '14155238886',
      `5215512956265`,
      `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${payingTotal}`,
    )
  }
  EVENTS.ISSUE_CHANGED(tableId)
  return redirect(redirectTo)
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const order = await getOrder(tableId)

  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: {orderId: order.id, activeOnOrder: true},
    include: {menuItem: true, user: true},
  })
  const total = order.total

  const currency = await getCurrency(tableId)
  const amountLeft = await getAmountLeftToPay(tableId)

  return json({
    cartItems,
    total,
    tipsPercentages,
    paymentMethods,
    currency,
    amountLeft,
  })
}

export default function EqualParts() {
  const navigate = useNavigate()
  const data = useLiveLoader<typeof loader>()

  const [personQuantity, setPersonQuantity] = React.useState(2)
  const [activate, setActivate] = React.useState(false)
  const [perPerson, setPerPerson] = React.useState(Number(data.total))
  const [payingFor, setPayingFor] = React.useState(1)

  React.useEffect(() => {
    let amountPerPerson = Number(data.total) / personQuantity
    let perPerson = amountPerPerson * payingFor
    setPerPerson(perPerson)

    if (personQuantity >= payingFor && personQuantity > 2) {
      setActivate(true)
    } else {
      setActivate(false)
    }
  }, [personQuantity, payingFor])

  // function handleChange(event: React.FormEvent<HTMLFormElement>) {
  //   submit(event.currentTarget, {replace: true})
  // }

  let pathSize = 100
  let gapSize = 2
  let percentForOne = pathSize / personQuantity
  let greenedPercent = percentForOne * payingFor - gapSize
  let notGreenedPercent = percentForOne * (personQuantity - payingFor) + gapSize

  return (
    <Modal
      onClose={() => navigate('..')}
      // fullScreen={true}
      title="Dividir en partes iguales"
    >
      <Form
        method="POST"
        preventScrollReset
        // onChange={handleChange}
        className=""
      >
        <H5 variant="secondary" className="mr-2 text-end xs:text-sm">
          Elige personas en mesa y cuántas pagarás.
        </H5>
        <div className=" p-4 xs:flex xs:h-1/4 xs:flex-row xs:items-center xs:p-2">
          <div className="z-0 flex flex-row justify-center space-x-2 p-4 ">
            {/* Add more circles with decreasing radius and increasing stroke width */}

            <AnimatePresence>
              <div className="relative h-52 w-52 md:h-32 md:w-32 xs:h-16 xs:w-16 ">
                <svg className="-rotate-90 fill-none" viewBox="0 0 36 36">
                  <motion.circle
                    initial={{strokeDashoffset: 0, opacity: 0}}
                    animate={{
                      strokeDasharray: `${percentForOne - gapSize} ,${gapSize}`,
                      opacity: 1,
                    }}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    strokeWidth="2"
                    pathLength="100"
                    className=" stroke-componentBg dark:stroke-night-400"
                  />

                  <motion.circle
                    initial={{strokeDashoffset: 0, opacity: 0}}
                    animate={{
                      strokeDasharray: `${greenedPercent},${notGreenedPercent}`,
                      opacity: 1,
                    }}
                    strokeLinecap="round" // aquí es donde se aplica
                    cx="18"
                    cy="18"
                    r="15.9155"
                    id="myPath"
                    pathLength="100"
                    strokeWidth="2"
                    stroke="#10b981"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center md:text-xs xs:hidden ">
                  <p>
                    Pagando por {payingFor}{' '}
                    {payingFor > 1 ? 'personas' : 'persona'}
                  </p>
                </div>
              </div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col space-y-2 p-2 xs:space-y-1">
            <div className="flex flex-row items-center justify-between space-y-2 xs:space-x-2 ">
              <div className="flex flex-col items-center">
                <p className="text-md shrink-0 xs:text-xs">Personas en</p>
                <p className="text-md shrink-0 xs:text-xs"> la mesa</p>
              </div>

              <QuantityManagerButton
                quantity={personQuantity}
                setQuantity={setPersonQuantity}
                setPayingFor={setPayingFor}
                payingFor={payingFor}
                activate={activate}
              />
            </div>

            {/* <Divider /> */}
            <div className="flex flex-row items-center justify-between space-y-2 ">
              <p className="text-md xs:text-xs">Pagando por</p>
              <QuantityManagerButton
                quantity={payingFor}
                setQuantity={setPayingFor}
                // tableNum={table.table_number}
                disabledPlus={personQuantity === payingFor}
              />
            </div>
          </div>
        </div>
        <Payment
          amountLeft={data.amountLeft}
          amountToPayState={perPerson}
          currency={data.currency}
          paymentMethods={data.paymentMethods as any}
          tipsPercentages={data.tipsPercentages}
        />
        <input type="hidden" name="payingTotal" value={perPerson} />
      </Form>
    </Modal>
  )
}
