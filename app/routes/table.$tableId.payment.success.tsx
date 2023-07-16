import {type PaymentMethod} from '@prisma/client'
import {type LoaderArgs, redirect} from '@remix-run/node'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getBranchId} from '~/models/branch.server'
import {getOrder} from '~/models/order.server'
import {assignUserNewPayments} from '~/models/user.server'
import {getSession, getUserId, sessionStorage} from '~/session.server'

export const loader = async ({params, request}: LoaderArgs) => {
  const {tableId} = params

  const session = await getSession(request)
  const branchId = await getBranchId(tableId)
  const userId = await getUserId(session)
  const order = await getOrder(tableId)
  const user = await prisma.user.findUnique({where: {id: userId}})

  const searchParams = new URL(request.url).searchParams
  const paymentMethod = searchParams.get('paymentMethod')
  const typeOfPayment = searchParams.get('typeOfPayment')
  const amount = Number(searchParams.get('amount'))
  const tip = Number(searchParams.get('tip'))
  const extraData = JSON.parse(searchParams.get('extraData'))
  const isOrderAmountFullPaid = searchParams.get('isOrderAmountFullPaid')

  await assignUserNewPayments(userId, amount, tip)
  await prisma.payments.create({
    data: {
      amount: amount,
      method: paymentMethod as PaymentMethod,
      orderId: order.id,
      tip: tip,
      total: amount + tip,
      branchId: branchId,
      userId: userId,
    },
  })

  if (isOrderAmountFullPaid === 'true') {
    await prisma.order.update({
      where: {id: order.id},
      data: {
        paid: true,
        paidDate: new Date(),
        tip: Number(order?.tip) + tip,
      },
    })
  }
  const username = user?.name
  const itemData = extraData

  switch (typeOfPayment) {
    case 'cartPay':
      session.flash('notification', 'Haz pagado tu orden con éxito')
      session.unset('cart')
      await updatePaidItemsAndUserData(itemData, username || '')
      break
    case 'perDish':
      //   await updatePaidItemsAndUserData(itemData, username || '')
      session.flash('notification', 'Pago realizado con éxito')
      break
    case 'fullpay':
      session.flash('notification', 'Haz pagado la cuenta completa con éxito')
      await prisma.order.update({
        where: {id: order.id},
        data: {
          active: false,
          paid: true,
          paidDate: new Date(),
        },
      })
      break
  }

  //   session.flash('success', 'Pago realizado con éxito')
  EVENTS.ISSUE_CHANGED(tableId)

  return redirect(`/table/${tableId}`, {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}

// const PaymentSuccess = () => {
//   return (
//     <div>
//       <h1>Payment Cancelled!</h1>
//       <p>Thank you for your purchase.</p>
//     </div>
//   )
// }

// export default PaymentSuccess

const updatePaidItemsAndUserData = async (
  itemData: {itemId: string; price: string}[],
  userName: string,
) => {
  // Loop through items and update price and paid
  for (const {itemId} of itemData) {
    const cartItem = await prisma.cartItem.findUnique({
      where: {id: itemId},
    })
    if (cartItem) {
      await prisma.cartItem.update({
        where: {id: itemId},
        data: {paid: true, paidBy: userName},
      })
    }
  }
}
