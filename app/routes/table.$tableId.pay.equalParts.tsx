import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import {AnimatePresence, motion} from 'framer-motion'
import React from 'react'
import invariant from 'tiny-invariant'
import {H5, Payment, QuantityManagerButton} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {getPaymentMethods, getTipsPercentages} from '~/models/branch.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string
  console.log('tipPercentage', tipPercentage)

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

  const total = await prisma.order
    .aggregate({
      where: {id: order.id},
      _sum: {total: true},
    })
    .then(res => res._sum.total)

  if (!total) {
    return json({error: 'No se ha seleccionado ningún platillo'}, {status: 400})
  }

  const payingTotal = Number(formData.get('payingTotal')) as number
  const tip = Number(payingTotal) * (Number(tipPercentage) / 100)
  console.log('tip', tip)
  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  let error = ''
  if (amountLeft < Number(total)) {
    error = 'Estas pagando de mas...'
  }
  //WHEN SUBMIT
  if (proceed) {
    if (amountLeft < Number(total)) {
      return redirect(
        `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
          tip <= 0 ? Number(total) * 0.12 : tip
        }`,
      )
    }
    const userId = await getUserId(request)
    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    const updateUser = await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + payingTotal,
        tip: Number(userPrevPaidData?.tip) + tip,
        total: Number(userPrevPaidData?.total) + payingTotal + tip,
      },
    })
    return redirect(redirectTo)
  }

  return json({total, tipPercentage, error, tip})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: {orderId: order.id, activeOnOrder: true},
    include: {menuItem: true, user: true},
  })
  const total = await prisma.order
    .aggregate({
      where: {id: order.id},
      _sum: {total: true},
    })
    .then(res => res._sum.total)

  const currency = await getCurrency(tableId)

  return json({cartItems, total, tipsPercentages, paymentMethods, currency})
}

export default function EqualParts() {
  const navigate = useNavigate()
  const data = useLoaderData()
  const actionData = useActionData()
  const submit = useSubmit()

  const [personQuantity, setPersonQuantity] = React.useState(2)
  const [activate, setActivate] = React.useState(false)
  const [perPerson, setPerPerson] = React.useState(data.total)
  const [payingFor, setPayingFor] = React.useState(1)

  React.useEffect(() => {
    let amountPerPerson = data.total / personQuantity
    let perPerson = amountPerPerson * payingFor
    setPerPerson(perPerson)

    if (personQuantity >= payingFor && personQuantity > 2) {
      setActivate(true)
    } else {
      setActivate(false)
    }
  }, [personQuantity, payingFor])

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  let pathSize = 100
  let gapSize = 2
  let percentForOne = pathSize / personQuantity
  let greenedPercent = percentForOne * payingFor - gapSize
  let notGreenedPercent = percentForOne * (personQuantity - payingFor) + gapSize

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Dividir en partes iguales"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <H5 variant="secondary" className="xs:text-sm mr-2 mt-2 text-end">
          Elige personas en mesa y cuántas pagarás.
        </H5>
        <div className="xs:flex xs:flex-row xs:p-2 xs:items-center xs:h-1/4 p-4">
          <div className="flex flex-row justify-center space-x-2 p-4 ">
            {/* Add more circles with decreasing radius and increasing stroke width */}

            <AnimatePresence>
              <div className="xs:w-16 xs:h-16 relative h-52 w-52 md:h-32 md:w-32 ">
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
                    cx="18"
                    cy="18"
                    r="15.9155"
                    id="myPath"
                    pathLength="100"
                    strokeWidth="2"
                    stroke="#10b981"
                  />
                </svg>
                <div className="xs:hidden absolute inset-0 flex items-center justify-center p-8 text-center md:text-xs ">
                  <p>
                    pagando por {payingFor}{' '}
                    {payingFor > 1 ? 'personas' : 'persona'}
                  </p>
                </div>
              </div>
            </AnimatePresence>
          </div>
        </div>

        <div className="xs:space-y-1 flex flex-col space-y-2">
          <div className="xs:space-x-2 flex flex-row items-center justify-between space-y-2 ">
            <p className="text-md xs:text-xs shrink-0">Personas en la mesa</p>
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
        <H5 variant="error">{actionData?.error}</H5>
        <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
        />
        <input type="hidden" name="payingTotal" value={perPerson} />
      </Form>
    </Modal>
  )
}
