import {json, redirect} from '@remix-run/node'
import type {ActionArgs} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {getOrder} from '~/models/order.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {getAmountLeftToPay} from '~/utils'

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()
  const {tableId} = params
  invariant(tableId, 'tableId no encontrado')
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const userId = await getUserId(request)

  const payAction = formData.get('payAction') as string
  const tipPercentage = formData.get('tipPercentage') as string
  //   const total = Number(
  //     formData.getAll('selectedUsers').reduce((a, b) => {
  //       return a + parseFloat(b)
  //     }, 0),
  //   )
  //   if (total) {
  //     return json({total})
  //   }

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden')

  const amountLeft = await getAmountLeftToPay(tableId)
  const userPrevPaid = await prisma.user.findFirst({
    where: {id: userId},
    select: {paid: true},
  })
  const newPaid = Number(amountLeft) + Number(userPrevPaid?.paid)
  //FIX this \/
  //@ts-expect-error
  const tip = amountLeft * Number(tipPercentage)
  console.log(`💰 ${userId} Pagando toda la cuenta`)
  const updateTotal = await prisma.order.update({
    where: {tableId: tableId},
    data: {
      paid: true,
      users: {
        update: {
          where: {id: userId},
          data: {
            paid: newPaid,
            tip: tip,

            total: tip + newPaid,
          },
        },
      },
    },
  })

  return redirect(redirectTo)
}
