import {ChevronRightIcon, ChevronUpIcon} from '@heroicons/react/outline'
import type {PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {Form, useLoaderData, useNavigate, useNavigation} from '@remix-run/react'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import React from 'react'
import invariant from 'tiny-invariant'
import {BillAmount, Button, FlexRow, H3, H4, H5, H6, Spacer} from '~/components'
import {Modal, SubModal} from '~/components/modal'
import {
  getBranch,
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getOrder} from '~/models/order.server'
import {getPaidUsers} from '~/models/user.server'
import {validateFullPay} from '~/models/validations.server'
import {validateRedirect} from '~/redirect.server'
import {getSession} from '~/session.server'
import {useLiveLoader} from '~/use-live-loader'
import {
  Translate,
  formatCurrency,
  getAmountLeftToPay,
  getCurrency,
} from '~/utils'
import {handlePaymentProcessing} from '~/utils/payment-processing.server'

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

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
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

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
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
  const menuCurrency = await getMenu(branchId).then(
    (menu: any) => menu?.currency || 'mxn',
  )
  //FIX this \/
  //@ts-expect-error
  const tip = amountLeft * Number(tipPercentage / 100)

  const result = await handlePaymentProcessing(
    paymentMethod as string,
    amountLeft,
    tip,
    menuCurrency,
    true,
    request,
    redirectTo,
    'fullpay',
  )

  if (result.type === 'redirect') {
    return redirect(result.url)
  }
  // if (paymentMethod === 'card') {
  //   const stripeRedirectUrl = await getStripeSession(
  //     amountLeft * 100 + tip * 100,
  //     true,
  //     getDomainUrl(request) + redirectTo,
  //     'eur',
  //     tip,
  //     paymentMethod,
  //     'fullpay',
  //   )
  //   return redirect(stripeRedirectUrl)
  // } else if (paymentMethod === 'cash') {
  //   const params = {
  //     typeOfPayment: 'fullpay',
  //     amount: amountLeft + tip,
  //     tip: tip,
  //     paymentMethod: paymentMethod,
  //     // extraData: extraData ? JSON.stringify(extraData) : undefined,
  //     isOrderAmountFullPaid: true,
  //   }
  //   const queryString = createQueryString(params)
  //   return redirect(`/table/${tableId}/payment/success?${queryString}`)
  // }

  return json({success: true})
}

export default function FullPay() {
  const data = useLiveLoader<LoaderData>()
  const navigate = useNavigate()

  return (
    <Modal
      onClose={() => navigate('..')}
      // fullScreen={true}
      title="Pagar cuenta completa"
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
          <Pay />
        </Form>
      </div>
    </Modal>
  )
}

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

export function Pay() {
  const data = useLoaderData()
  const navigation = useNavigation()

  const [tipRadio, setTipRadio] = React.useState(12)
  const [paymentRadio, setPaymentRadio] = React.useState('cash')
  const [showModal, setShowModal] = React.useState({
    tip: false,
    payment: false,
  })

  const tip = Number(data.amountLeft) * (Number(tipRadio) / 100)
  const total = Number(data.amountLeft) + tip

  const handleTipChange = e => {
    setTipRadio(Number(e.target.value))
    // submit(e.target.form, {method: 'post'})
  }
  const handleMethodChange = e => {
    setPaymentRadio(e.target.value)
  }
  const isSubmitting = navigation.state !== 'idle'

  return (
    <>
      <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-4 bg-day-bg_principal px-3">
        <Spacer spaceY="2" />
        <FlexRow justify="between">
          <H5>Queda por pagar:</H5>
          <H3>
            {formatCurrency(
              data.currency,
              data.amountLeft ? data.amountLeft : total,
            )}
          </H3>
        </FlexRow>
        <Spacer spaceY="1" />
        <AnimatePresence initial={false}>
          {total > 0 && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate={total > 0 ? 'visible' : 'hidden'}
              exit="hidden"
              className="flex flex-col"
            >
              <FlexRow justify="between">
                <H5>Total seleccionado:</H5>
                <H3>{formatCurrency(data.currency, total ? total : 0)}</H3>
              </FlexRow>
              <Spacer spaceY="1" />
              <hr />
              <Spacer spaceY="2" />

              <button
                className="flex flex-row items-center justify-between"
                type="button"
                onClick={() => setShowModal({...showModal, tip: true})}
              >
                <H5>Propina</H5>
                <FlexRow>
                  <FlexRow>
                    <H4 variant="secondary">{tipRadio}%</H4>
                    <H3>{formatCurrency(data.currency, tip)}</H3>
                  </FlexRow>
                  {showModal.tip ? (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cerrar</H6>
                      <ChevronUpIcon className="h-4 w-4" />
                    </FlexRow>
                  ) : (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cambiar</H6>
                      <ChevronRightIcon className="h-4 w-4" />
                    </FlexRow>
                  )}
                </FlexRow>
              </button>

              <Spacer spaceY="2" />
              <button
                className="flex flex-row items-center justify-between"
                type="button"
                onClick={() => setShowModal({...showModal, payment: true})}
              >
                <H5>Método de pago</H5>
                <FlexRow>
                  <H3>{Translate(data.language, paymentRadio)}</H3>
                  {showModal.payment ? (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cerrar</H6>
                      <ChevronUpIcon className="h-4 w-4" />
                    </FlexRow>
                  ) : (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cambiar</H6>
                      <ChevronRightIcon className="h-4 w-4" />
                    </FlexRow>
                  )}
                </FlexRow>
              </button>
              <Spacer spaceY="2" />

              <Spacer spaceY="2" />
              <Button fullWith={true} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Pagar'}{' '}
                {formatCurrency(
                  data.currency,
                  total, // Update the total amount
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showModal.tip && (
        <SubModal
          onClose={() => setShowModal({...showModal, tip: false})}
          title="Asignar propina"
        >
          <div className="flex flex-col space-y-2">
            {data.tipsPercentages.map((tipPercentage: any) => (
              <label
                key={tipPercentage}
                className={clsx(
                  'flex w-full flex-row items-center justify-center space-x-2 rounded-full border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                      tipRadio.toString() === tipPercentage,
                    'bg-white': tipRadio.toString() !== tipPercentage,
                  },
                )}
              >
                <div>
                  <H3>{tipPercentage}%</H3>
                  <H5>
                    {formatCurrency(
                      data.currency,
                      Number(data.amountLeft) * (Number(tipPercentage) / 100),
                    )}
                  </H5>
                </div>
                <input
                  type="radio"
                  name="tipPercentage"
                  // defaultChecked={tipPercentage === '12'}
                  value={tipPercentage}
                  onChange={handleTipChange}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
          <Spacer spaceY="2" />
          <Button
            fullWith={true}
            onClick={() => setShowModal({...showModal, tip: false})}
          >
            Asignar propina
          </Button>
        </SubModal>
      )}
      {showModal.payment && (
        <SubModal
          onClose={() => setShowModal({...showModal, payment: false})}
          title="Asignar método de pago"
        >
          <div className="flex flex-col space-y-2">
            {data.paymentMethods.paymentMethods.map((paymentMethod: any) => {
              const translate = Translate(data.language, paymentMethod)
              return (
                <label
                  key={paymentMethod}
                  className={clsx(
                    'flex w-full flex-row items-center justify-center space-x-2 rounded-full border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
                    {
                      'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                        paymentRadio === paymentMethod,
                    },
                  )}
                >
                  {translate}
                  <input
                    type="radio"
                    name="paymentMethod"
                    // defaultChecked={paymentMethod === 'cash'}
                    value={paymentMethod}
                    onChange={handleMethodChange}
                    className="sr-only"
                  />
                </label>
              )
            })}
            <Spacer spaceY="2" />
            <Button
              fullWith={true}
              onClick={() => setShowModal({...showModal, payment: false})}
            >
              Asignar
            </Button>
          </div>
        </SubModal>
      )}
      <input type="hidden" name="paymentMethod" value={paymentRadio} />
      <input type="hidden" name="tipPercentage" value={tipRadio} />
    </>
  )
}
