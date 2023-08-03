import type { CartItem, Order, PaymentMethod, User } from '@prisma/client'
import { json, redirect } from '@remix-run/node'
import { Outlet, useFetcher, useLoaderData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import clsx from 'clsx'
import cuid from 'cuid'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import invariant from 'tiny-invariant'
import { Button, ChevronRightIcon, ChevronUpIcon, FlexRow, H2, H3, H4, H5, H6, ItemContainer, Modal, QuantityButton, Spacer, Underline } from '~/components'
import { SubModal } from '~/components/modal'
import { prisma } from '~/db.server'
import { EVENTS } from '~/events'
import { getBranch, getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getDvctToken } from '~/models/deliverect.server'
import { getOrderTotal } from '~/models/order.server'
import { getTable } from '~/models/table.server'

import { validateRedirect } from '~/redirect.server'
import { getSession, sessionStorage, updateCartItem } from '~/session.server'

import { Translate, createQueryString, formatCurrency, getAmountLeftToPay, getCurrency } from '~/utils'
import { getDomainUrl, getStripeSession } from '~/utils/stripe.server'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.menuItem.findFirst({
    where: { id: dishId },
  })

  const session = await getSession(request)

  const categories = await prisma.menuCategory.findMany({
    where: { menuId },
    include: {
      menuItems: true,
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

  const amountLeft = await getAmountLeftToPay(tableId)
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

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

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const variantId = formData.get('variantId') as string
  const _action = formData.get('_action') as string

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const session = await getSession(request)
  const shareDish = JSON.parse(session.get('shareUserIds') || false)
  let cart = JSON.parse(session.get('cart') || '[]')
  const quantityStr = cart.find((item: { variantId: string }) => item.variantId === variantId)?.quantity
  const userId = session.get('userId')

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
      let adjustedItems = cartItems.map(item => {
        return {
          plu: item.id,
          price: Number(item.price) * 100,
          quantity: item.quantity,
          remark: item.comments ?? 'No remarks',
          name: item.name,
        }
      })
      //NOTE - Se usa porque deliverect no recibe puntos decimales, por lo que se multiplica por 100
      const adjustedCartItemsTotal = cartItemsTotal * 100
      //TODO SI ESTA VENCIDO EL TOKEN, HACER UN REFRESH en donde???
      const token = await getDvctToken()
      const table = await getTable(tableId)
      let order:
        | (Order & {
            users?: User[]
          })
        | null = await prisma.order.findFirst({
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
            creationDate: new Date(),
            orderedDate: new Date(),
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

      // const createCartItems =
      await Promise.all(
        cartItems.map(item =>
          prisma.cartItem.create({
            data: {
              image: item.image,
              quantity: Number(item.quantity),
              price: Number(item.price),
              name: item.name,
              menuItemId: item.id,
              modifier: {
                connect: item.modifiers.map(modifier => ({
                  id: modifier.id,
                })),
              },

              //if shareDish is not empty, connect the users to the cartItem
              user: {
                connect: shareDish.length > 0 ? [{ id: userId }, ...shareDish.map(id => ({ id: id }))] : { id: userId },
              } as any,
              activeOnOrder: true,
              orderId: order?.id,
              // make sure to include other necessary fields here
            },
          }),
        ),
      )
      //NOTE - Aqui se usa el request.method para identificar que boton se esta usando
      if (request.method === 'PATCH') {
        const tipPercentage = formData.get('tipPercentage') as string
        const paymentMethod = formData.get('paymentMethod') as PaymentMethod
        const amountToPay = Number(formData.get('amountToPay'))

        //FIX this \/
        //@ts-expect-error
        const tip = amountToPay * Number(tipPercentage / 100)

        switch (paymentMethod) {
          case 'cash':
            const params = {
              typeOfPayment: 'cartPay',
              amount: amountToPay + tip,
              tip: tip,
              paymentMethod: paymentMethod,
              // extraData: itemData ? JSON.stringify(itemData) : undefined,
              isOrderAmountFullPaid: false,
            }
            const queryString = createQueryString(params)
            return redirect(`${redirectTo}/payment/success?${queryString}`)
          case 'card':
            const stripeRedirectUrl = await getStripeSession(
              amountToPay * 100 + tip * 100,
              false,
              getDomainUrl(request) + redirectTo,
              //FIXME aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
              'eur',
              tip,
              paymentMethod,
              'cartPay',
              //FIXME le estoy pasando mas de 500 characters y hay error.
              //Es Para alterar los cartItems y que se vean quien pago
              // cartItems,
            )
            return redirect(stripeRedirectUrl)
        }
      }

      //TODO: cambiar el channelname y channelLinkId agarrandolos de la base de datos o api
      const url = process.env.DELIVERECT_API_URL + '/joseantonioamieva/order/649c4d38770ee8288c5a8729'
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          customer: { name: 'John ' },
          orderIsAlreadyPaid: false,
          payment: { amount: adjustedCartItemsTotal, type: 0 },
          items: adjustedItems,
          decimalDigits: 2,
          // channelOrderId: order.id,
          // channelOrderDisplayId: order.id + '12111',
          channelOrderId: cuid(),
          channelOrderDisplayId: '1234567ABC',
          orderType: 3,
          table: String(table.table_number),
        }),
      }
      fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err))

      session.unset('cart')
      EVENTS.ISSUE_CHANGED(tableId)

      return redirect(redirectTo, {
        headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
      })
  }

  return redirect('', {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}

export default function Cart() {
  const data = useLoaderData()
  const [item, setItem] = React.useState('')
  const fetcher = useFetcher()
  const params = useParams()

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

  const cartItemsTotal = data.cartItems?.reduce((acc, item) => {
    return acc + Number(item.price) * item.quantity
  }, 0)

  let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <>
      <Modal onClose={onClose} title="Carrito">
        <fetcher.Form method="POST" preventScrollReset>
          <div className="p-2">
            {/* <H5 className="px-2 text-end">Tus platillos</H5> */}
            <div className="space-y-2">
              {data.cartItems?.map((items: CartItem, index: number) => {
                return (
                  <ItemContainer key={index} className="flex flex-row items-center justify-between space-x-2 ">
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
                  </ItemContainer>
                )
              })}
            </div>
          </div>
          <Spacer spaceY="2" />
          {!showPaymentOptions ? (
            <div className="sticky bottom-0 rounded-t-lg border-x border-t bg-day-bg_principal p-2">
              <FlexRow justify="between" className="px-2">
                <H4>Numero de platillos: </H4>
                <H3>{cartItemsQuantity}</H3>
              </FlexRow>
              <FlexRow justify="between" className="px-2">
                <H4>Total: </H4>
                <Underline>
                  <H2>{formatCurrency(data.currency, cartItemsTotal)}</H2>
                </Underline>
              </FlexRow>
              <Spacer spaceY="3" />
              <Button name="_action" value="submitCart" type="submit" size="medium" disabled={isSubmitting || data.cartItems?.length === 0} className="w-full">
                {isSubmitting ? (
                  'Agregando platillos...'
                ) : (
                  <div>
                    <span className="font-light">Ordenar y </span>
                    {<span className="button-outline font-bold underline-offset-8">pagar después</span>}
                  </div>
                )}
              </Button>
              <Spacer spaceY="1" />
              <Button
                onClick={() => setShowPaymentOptions(true)}
                className="w-full text-white"
                type="button"
                size="medium"
                variant="custom"
                custom="bg-success border-button-successOutline"
              >
                ¡ Quiero pagar ahora 👍🏼 !
              </Button>
            </div>
          ) : (
            <CartPayment setShowPaymentOptions={setShowPaymentOptions} />
          )}
        </fetcher.Form>
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

  const [tipRadio, setTipRadio] = React.useState(12)
  const [paymentRadio, setPaymentRadio] = React.useState('cash')
  const [showModal, setShowModal] = React.useState({
    tip: false,
    payment: false,
  })

  const total = data.cartItemsTotal
  const tip = Number(total) * (Number(tipRadio) / 100)

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
        <motion.div variants={variants} initial="hidden" animate={'visible'} exit="hidden" className="flex flex-col">
          <FlexRow justify="between">
            <H5>Cantidad por {data.cartItems.length} platillos:</H5>
            <H3>{formatCurrency(data.currency, total ? total : 0)}</H3>
          </FlexRow>
          <Spacer spaceY="1" />

          <hr />
          <Spacer spaceY="2" />

          <button className="flex flex-row items-center justify-between" type="button" onClick={() => setShowModal({ ...showModal, tip: true })}>
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
          <button className="flex flex-row items-center justify-between" type="button" onClick={() => setShowModal({ ...showModal, payment: true })}>
            <H5>Método de pago</H5>
            <FlexRow>
              <H3>{Translate('es', paymentRadio)}</H3>
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
          <hr />
          <Spacer spaceY="2" />
          <FlexRow justify="between">
            <H5>Total:</H5>
            <Underline>
              <H3>
                {formatCurrency(
                  data.currency,
                  total + tip, // Update the total amount
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
            variant="custom"
            custom="bg-button-successOutline border-green-700"
            className="text-button-successBg"
          >
            {isSubmitting ? 'Procesando...' : 'Pagar y ordenar'}{' '}
          </Button>
          <Spacer spaceY="1" />
          <Button onClick={() => setShowPaymentOptions(false)} to="" variant={'danger'}>
            Volver
          </Button>
        </motion.div>
        {/* )}
        </AnimatePresence> */}
      </div>
      {/* ANCHOR MODAL TIP */}
      {showModal.tip && (
        <SubModal onClose={() => setShowModal({ ...showModal, tip: false })} title="Asignar propina">
          <div className="flex flex-col space-y-2">
            {data.tipsPercentages.map((tipPercentage: any) => (
              <label
                key={tipPercentage}
                className={clsx(
                  'flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline': tipRadio.toString() === tipPercentage,
                  },
                )}
              >
                <FlexRow justify="between" className="w-full">
                  <H4>
                    {tipPercentage >= 10 && tipPercentage < 12
                      ? 'Muchas gracias!'
                      : tipPercentage >= 12 && tipPercentage < 15
                      ? 'Excelente servicio!'
                      : tipPercentage >= 15 && tipPercentage < 18
                      ? '❤️ Wow!'
                      : tipPercentage >= 18
                      ? 'Eres increible!'
                      : tipPercentage === '0'
                      ? 'No dejar propina'
                      : 'otro'}
                  </H4>
                  <H3>{tipPercentage}%</H3>
                </FlexRow>
                <input type="radio" name="tipPercentage" value={tipPercentage} onChange={handleTipChange} className="sr-only" />
              </label>
            ))}
          </div>
          <Spacer spaceY="2" />
          <H3 className="flex w-full flex-row justify-center">
            <Underline>Estas dejando {formatCurrency(data.currency, (tipRadio * total) / 100)} de propina</Underline>
          </H3>
          <Spacer spaceY="2" />
          <Button fullWith={true} onClick={() => setShowModal({ ...showModal, tip: false })}>
            Asignar
          </Button>
        </SubModal>
      )}

      {showModal.payment && (
        <SubModal onClose={() => setShowModal({ ...showModal, payment: false })} title="Asignar método de pago">
          <div className="space-y-2">
            {data.paymentMethods.paymentMethods.map((paymentMethod: any) => {
              const translate = Translate('es', paymentMethod)
              return (
                <label
                  key={paymentMethod}
                  className={clsx('flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg', {
                    'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline': paymentRadio === paymentMethod,
                  })}
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
            <Button fullWith={true} onClick={() => setShowModal({ ...showModal, payment: false })}>
              Asignar
            </Button>
          </div>
        </SubModal>
      )}
      <input type="hidden" name="paymentMethod" value={paymentRadio} />
      <input type="hidden" name="tipPercentage" value={tipRadio} />
      <input type="hidden" name="cartItems" value={data.cartItems} />
      <input type="hidden" name="amountToPay" value={data?.cartItemsTotal} />
    </>
  )
}
