import type {ActionArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import {Payment} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const total = Number(formData.get('amountToPay')) as number
  const tipPercentage = formData.get('tipPercentage') as string

  if (!proceed && tipPercentage && total <= 0) {
    return json({error: 'Antes de asignar propina, ingresa un monto por pagar'})
  }

  if (proceed && total <= 0) {
    return json({
      error: 'El monto a pagar debe ser mayor a 0 ',
    })
  }

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

  const orderTotal = await prisma.order
    .aggregate({
      where: {id: order.id},
      _sum: {total: true},
    })
    .then(res => res._sum.total)

  const tip = Number(total) * (Number(tipPercentage) / 100)
  console.log('tip, total', tip, total)

  if (proceed) {
    //WHEN SUBMIT
    const userId = await getUserId(request)
    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    const updateUser = await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + total,
        tip: Number(userPrevPaidData?.tip) + tip,
        total: Number(userPrevPaidData?.total) + total + tip,
      },
    })
    return redirect(redirectTo)
  }

  return json({total, tip})
}

// export async function loader({request, params}: LoaderArgs) {
//   const {tableId} = params
//   invariant(tableId, 'No se encontró mesa')

//   const order = await prisma.order.findFirst({
//     where: {tableId},
//   })
//   invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

//   const total = await prisma.order
//     .aggregate({
//       where: {id: order.id},
//       _sum: {total: true},
//     })
//     .then(res => res._sum.total)

//   return json({total})
// }

export default function EqualParts() {
  const navigate = useNavigate()
  const data = useLoaderData()
  const actionData = useActionData()

  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={false}
      title="Dividir en partes iguales"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <div className="flex flex-row items-center w-full px-4 py-2 bg-componentBg dark:bg-DARK_0 ">
          <label
            htmlFor="custom"
            className="bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]"
          >
            {'$'}
          </label>
          <input
            type="number"
            name="amountToPay"
            min="0"
            id="custom"
            inputMode="decimal"
            // onChange={e => setAmount(Number(e.target.value))}
            className="flex w-full h-20 text-6xl bg-transparent dark:bg-DARK-0 placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 "
            // defaultValue={userTotal ? userTotal : ''}
            placeholder="0.00"
          />
        </div>
        {actionData?.error}
        <Payment total={actionData?.total} tip={actionData?.tip} />
      </Form>
    </Modal>
  )
}
