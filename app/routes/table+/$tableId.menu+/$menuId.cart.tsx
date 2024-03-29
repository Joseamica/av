import { Outlet, useFetcher, useLoaderData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import React, { useState } from 'react'
import { FaClock } from 'react-icons/fa'
import { IoCardOutline } from 'react-icons/io5'

import { json, redirect } from '@remix-run/node'
import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import type { CartItem, Order, PaymentMethod, User } from '@prisma/client'
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, sessionStorage, updateCartItem } from '~/session.server'
import { sendWaNotification } from '~/twilio.server'
import { useLiveLoader } from '~/use-live-loader'

import { getBranch, getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { createCartItems, getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'
import { getOrderTotal } from '~/models/order.server'
import { getTable } from '~/models/table.server'

import { EVENTS } from '~/events'

import { formatCurrency, getAmountLeftToPay, getCurrency } from '~/utils'
import { handlePaymentProcessing } from '~/utils/payment-processing.server'

import { Button, FlexRow, H3, H4, H5, Modal, QuantityButton, Spacer, SwitchButton, Underline } from '~/components'
import Payment, { usePayment } from '~/components/payment/paymentV3'

// ANCHOR LOADER
export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.product.findFirst({
    where: { id: dishId },
  })

  const session = await getSession(request)

  const categories = await prisma.category.findMany({
    where: { menu: { some: { id: menuId } } },
    include: {
      products: true,
    },
  })
  //Find users on table that are not the current user,
  //this is to show users to share dishes with and you don't appear
  const usersOnTable = await prisma.user.findMany({
    where: { tableId, id: { not: session.get('userId') } },
  })

  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const cartItems = await getCartItems(cart)
  const currency = await getCurrency(tableId)

  let cartItemsTotal =
    cartItems.reduce((acc, item) => {
      return acc + Number(item.price) * item.quantity
    }, 0) || 0

  const [amountLeft, tipsPercentages, paymentMethods] = await Promise.all([
    getAmountLeftToPay(tableId),
    getTipsPercentages(tableId),
    getPaymentMethods(tableId),
  ])

  return json({
    categories,
    cartItems,
    usersOnTable,
    dish,
    currency,
    cartItemsTotal,
    amountLeft,
    tipsPercentages,
    paymentMethods,
  })
}

// ANCHOR ACTION
export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const branch = await getBranch(tableId)
  const branch_name = branch?.name

  const formData = await request.formData()
  const variantId = formData.get('variantId') as string
  const _action = formData.get('_action') as string

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const session = await getSession(request)
  const shareDish = JSON.parse(session.get('shareUserIds') || false)
  let cart = JSON.parse(session.get('cart') || '[]')
  const quantityStr = cart.find((item: { variantId: string }) => item.variantId === variantId)?.quantity
  const userId = session.get('userId')
  const employees = await prisma.employee.findMany({
    where: { branchId: branchId },
  })
  const employeesNumbers = employees.map(employee => employee.phone)

  const cartItems = await getCartItems(cart)

  let cartItemsTotal =
    cartItems.reduce((acc, item) => {
      return acc + Number(item.price) * item.quantity
    }, 0) || 0

  switch (_action) {
    case 'increaseQuantity':
      if (!variantId || !quantityStr) {
        break
      }
      cart = updateCartItem(cart, variantId, quantityStr + 1)
      session.set('cart', JSON.stringify(cart))
      break
    case 'decreaseQuantity':
      if (!variantId || !quantityStr) {
        break
      }
      cart = updateCartItem(cart, variantId, quantityStr - 1)
      session.set('cart', JSON.stringify(cart))
      break
    case 'submitCart':
      const username = session.get('username')
      const table = await getTable(tableId)

      const items = cartItems.map(item => {
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          comments: item.comments,
          modifiers: item.modifiers,
        }
      })
      const formattedItems = items
        .map(item => {
          const modifiers = item.modifiers
            .map(modifier => {
              const totalModifierPrice = Number(modifier.quantity) * Number(modifier.extraPrice)
              return `\t\t- ${modifier.name}\n\t\t  Precio Extra: ${modifier.extraPrice || 'N/A'}\n\t\t  Cantidad: ${
                modifier.quantity
              }\n\t\t  Total de Modificadores: $${totalModifierPrice}\n`
            })
            .join('\n')

          return `*- ${item.name}*\n\tPrecio: ${item.price}\n\tCantidad: ${item.quantity}\n\t_Modificadores_:\n${modifiers}\n${
            item.comments ? item.comments : ''
          }\n`
        })
        .join('\n----------------\n')

      console.log(`${branch_name}: ${username} de la mesa ${table.number} ha ordenado:`)
      console.log(formattedItems)

      let order: (Order & { users?: User[] }) | null = await prisma.order.findFirst({
        where: {
          branchId: branchId,
          tableId: tableId,
        },
        include: {
          users: {
            where: { id: userId },
          },
        },
      })

      if (!order) {
        order = await prisma.order.create({
          data: {
            branchId: branchId,
            tableId: tableId,
            tableNumber: table.number,
            active: true,
            paid: false,
            total: cartItemsTotal,
            users: {
              connect: {
                id: userId,
              },
            },
          },
        })
        cartItemsTotal = 0
      } else {
        const orderTotal = (await getOrderTotal(order.id)) || { total: 0 }
        await prisma.order.update({
          where: { id: order.id },
          data: {
            total: Number(orderTotal.total) + Number(cartItemsTotal),
            paid: false,
            paidDate: null,
          },
        })
        // Connect user if not connected
        if (!order.users?.some((user: User) => user.id === userId)) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              users: {
                connect: {
                  id: userId,
                },
              },
            },
          })
        }
      }

      await createCartItems(cartItems, shareDish, userId, order.id, branchId, items)
      //Aqui se usa el request.method para identificar que boton se esta usando, en este caso Patch es que se esta pagando
      if (request.method === 'PATCH') {
        const tipPercentage = formData.get('tipPercentage') as string
        const paymentMethod = formData.get('paymentMethod') as PaymentMethod
        const amountToPay = Number(formData.get('amountToPay'))

        const tip = amountToPay * (Number(tipPercentage) / 100)
        const menuCurrency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')
        await prisma.notification.create({
          data: {
            message: `${username} de la mesa ${table.number} ha ordenado ${formattedItems}`,
            branchId: branchId,
            tableId: tableId,
            method: 'whatsapp',
            status: 'received',
            userId: userId,
            orderId: order.id,
            type: 'informative',
            type_temp: 'INFORMATIVE',
          },
        })
        const result = await handlePaymentProcessing({
          paymentMethod: paymentMethod as string,
          total: amountToPay,
          tip,
          currency: menuCurrency,
          isOrderAmountFullPaid: false,
          request,
          redirectTo,
          typeOfPayment: 'cartPay',
          extraData: { branchId, tableId, order: order },
        })
        EVENTS.ISSUE_CHANGED(tableId, branchId)
        session.unset('cart')
        // NOTE esto va aqui ya que si retorna un redirect no se ejecuta el codigo de abajo se agregan los productos, y no avisa pro whatsapp
        sendWaNotification({
          to: employeesNumbers,
          body: `\t${branch_name}: ${username} de la _mesa ${table.number}_ ha ordenado: \n----------------\n${formattedItems} \nLink: https://av.fly.dev/dashboard/table/${tableId}`,
        })
        if (result.type === 'redirect') {
          return redirect(result.url, {
            headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
          })
        }
      }

      // //TODO: cambiar el channelname y channelLinkId agarrandolos de la base de datos o api
      // const url = process.env.DELIVERECT_API_URL + '/joseantonioamieva/order/649c4d38770ee8288c5a8729'
      // const options = {
      //   method: 'POST',
      //   headers: {
      //     accept: 'application/json',
      //     'content-type': 'application/json',
      //     authorization: 'Bearer ' + token,
      //   },
      //   body: JSON.stringify({
      //     customer: { name: 'John ' },
      //     orderIsAlreadyPaid: false,
      //     payment: { amount: adjustedCartItemsTotal, type: 0 },
      //     items: adjustedItems,
      //     decimalDigits: 2,
      //     // channelOrderId: order.id,
      //     // channelOrderDisplayId: order.id + '12111',
      //     channelOrderId: cuid(),
      //     channelOrderDisplayId: '1234567ABC',
      //     orderType: 3,
      //     table: String(table.number),
      //   }),
      // }
      // fetch(url, options)
      //   .then(res => res.json())
      //   .then(json => console.log(json))
      //   .catch(err => console.error('error:' + err))

      session.unset('cart')

      sendWaNotification({
        to: employeesNumbers,
        body: `\t${branch_name}: ${username} de la _mesa ${table.number}_ ha ordenado: \n----------------\n${formattedItems} \nLink: https://av.fly.dev/dashboard/table/${tableId}`,
      })
      await prisma.notification.create({
        data: {
          message: `${branch_name}: ${username} de la mesa _${table.number}_ ha ordenado ${formattedItems}`,
          branchId: branchId,
          tableId: tableId,
          method: 'whatsapp',
          status: 'received',
          type: 'informative',
          type_temp: 'INFORMATIVE',
          userId: userId,
          orderId: order.id,
        },
      })
      await prisma.notification.create({
        data: {
          message: `${branch_name}: ${username} de la mesa ${table.number} ha ordenado ${formattedItems}`,
          branchId: branchId,
          employees: {
            connect: employees.map(employee => ({ id: employee.id })),
          },
          tableId: tableId,
          method: 'whatsapp',
          status: 'pending',
          type: 'informative',
          type_temp: 'ORDER',
          userId: userId,
          orderId: order.id,
        },
      })
      EVENTS.ISSUE_CHANGED(tableId, branchId)
      return redirect(redirectTo, {
        headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
      })
  }

  return json({ success: true }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } })
}

export default function Cart() {
  const data = useLiveLoader<any>()
  const [item, setItem] = React.useState('')
  const fetcher = useFetcher()
  const params = useParams()
  const [payNow, setPayNow] = useState(true)

  // const cart = searchParams.get('cart')
  const navigate = useNavigate()
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)

  const onClose = () => {
    navigate(`/table/${params.tableId}/menu/${params.menuId}`)
  }

  React.useEffect(() => {
    if (data.cartItems?.length === 0) {
      onClose()
    }
  }, [data.cartItems, navigate, params])

  const cartItemsQuantity = data.cartItems?.reduce((acc, item) => {
    return acc + item.quantity
  }, 0)

  let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <>
      <Modal onClose={onClose} title="Carrito">
        <Payment
          state={{
            amountLeft: data.amountLeft,
            amountToPayState: data.cartItemsTotal,
            currency: data.currency,
            paymentMethods: data.paymentMethods,
            tipsPercentages: data.tipsPercentages,
          }}
        >
          {!showPaymentOptions ? (
            <div className="px-4 py-2">
              <SwitchButton
                state={payNow}
                setToggle={setPayNow}
                leftText="Pagar después"
                rightText="Pagar ahora"
                rightIcon={<IoCardOutline />}
                leftIcon={<FaClock />}
                stretch
                height="medium"
                corner="none"
              />
            </div>
          ) : null}

          <fetcher.Form method="POST" preventScrollReset>
            <div className="p-2">
              <div className="space-y-2">
                {data.cartItems?.map((items: CartItem, index: number) => {
                  return (
                    <article
                      key={index}
                      className="container flex flex-row items-center justify-between h-16 px-2 space-x-2 bg-white border-2 rounded-3xl "
                    >
                      <input type="hidden" name="variantId" value={item} />
                      <FlexRow justify="between" className="w-full pr-2">
                        <H4>{items.name}</H4>
                        <H5 className="shrink-0">{formatCurrency(data.currency, items.price)}</H5>
                      </FlexRow>
                      <QuantityButton
                        isForm={true}
                        onDecrease={() => setItem(items.id)}
                        onIncrease={() => setItem(items.id)}
                        quantity={items.quantity}
                        name="_action"
                        decreaseValue="decreaseQuantity"
                        increaseValue="increaseQuantity"
                      />
                    </article>
                  )
                })}
              </div>
            </div>
            <Spacer spaceY="2" />
            {!showPaymentOptions ? (
              <div className="sticky bottom-0 p-2 border-t rounded-t-lg border-x bg-day-bg_principal">
                <FlexRow justify="between" className="px-2">
                  <H4>Numero de platillos: </H4>
                  <H4>{cartItemsQuantity}</H4>
                </FlexRow>
                <FlexRow justify="between" className="px-2">
                  <H4>Total: </H4>
                  <Underline>
                    <H4>{formatCurrency(data.currency, data.cartItemsTotal)}</H4>
                  </Underline>
                </FlexRow>
                <Spacer spaceY="3" />
                {payNow ? (
                  <Button
                    onClick={() => setShowPaymentOptions(true)}
                    className="w-full text-white"
                    type="button"
                    size="medium"
                    // variant="custom"
                    // custom="bg-success border-button-successOutline"
                  >
                    <div>
                      <span className="font-light">Pagar mis productos </span>
                      {<span className="font-bold button-outline underline-offset-8">ahora</span>}
                    </div>
                  </Button>
                ) : (
                  <Button
                    name="_action"
                    value="submitCart"
                    type="submit"
                    size="medium"
                    disabled={isSubmitting || data.cartItems?.length === 0}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      'Agregando platillos...'
                    ) : (
                      <div>
                        <span className="font-light">Ordenar y </span>
                        {<span className="font-bold button-outline underline-offset-8">pagar después</span>}
                      </div>
                    )}
                  </Button>
                )}

                <Spacer spaceY="1" />
              </div>
            ) : (
              <CartPayment setShowPaymentOptions={setShowPaymentOptions} />
            )}
          </fetcher.Form>
        </Payment>
      </Modal>
      <Outlet />
    </>
  )
}

const variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.4 },
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

export function CartPayment({ setShowPaymentOptions }: { setShowPaymentOptions: any }) {
  const data = useLoaderData()
  const navigation = useNavigation()
  const { showModal, paymentRadio, tip, tipRadio, avoqadoFee } = usePayment()

  const total = data.cartItemsTotal

  const isSubmitting = navigation.state !== 'idle'

  return (
    <>
      <div className="sticky inset-x-0 bottom-0 flex flex-col justify-center px-3 border-4 dark:bg-night-bg_principal dark:text-night-text_principal rounded-t-xl bg-day-bg_principal">
        <Spacer spaceY="2" />
        <motion.div variants={variants} initial="hidden" animate={'visible'} exit="hidden" className="flex flex-col">
          <FlexRow justify="between">
            <H5>Cantidad por {data.cartItems.length} platillos:</H5>
            <H3>{formatCurrency(data.currency, total ? total : 0)}</H3>
          </FlexRow>
          <Spacer spaceY="1" />

          <hr />
          <Spacer spaceY="2" />

          <Payment.TipButton />

          <Spacer spaceY="2" />

          <Payment.PayButton />
          <Spacer spaceY="2" />
          <FlexRow justify="between">
            <H5>Avoqado services:</H5>

            <H5>
              {formatCurrency(
                data.currency,
                avoqadoFee, // Update the total amount
              )}
            </H5>
          </FlexRow>
          <Spacer spaceY="2" />
          <hr />

          <Spacer spaceY="2" />
          <FlexRow justify="between">
            <H5>Total:</H5>
            <Underline>
              <H3>
                {formatCurrency(
                  data.currency,
                  total + tip + avoqadoFee, // Update the total amount
                )}
              </H3>
            </Underline>
          </FlexRow>
          <Spacer spaceY="2" />

          <Spacer spaceY="2" />
          <Button
            fullWith={true}
            disabled={isSubmitting}
            name="_action"
            value="submitCart"
            formMethod="PATCH"
            size="medium"
            // variant="custom"
            // custom="bg-button-successOutline border-green-700"
            // className="text-button-successBg"
          >
            {isSubmitting ? 'Procesando...' : 'Pagar y ordenar'}
          </Button>
          <Spacer spaceY="1" />
          <Button onClick={() => setShowPaymentOptions(false)} to="" variant={'danger'} size="medium">
            Volver
          </Button>
        </motion.div>
        {/* )}
        </AnimatePresence> */}
      </div>

      {/* ANCHOR MODAL TIP */}
      {showModal.tip && <Payment.TipModal />}

      {showModal.payment && <Payment.PayModal />}

      <input type="hidden" name="paymentMethod" value={paymentRadio} />
      <input type="hidden" name="tipPercentage" value={tipRadio} />
      <input type="hidden" name="cartItems" value={data.cartItems} />
      <input type="hidden" name="amountToPay" value={data?.cartItemsTotal} />
    </>
  )
}
