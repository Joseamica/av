import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {BillAmount, FlexRow} from '~/components'
import {Button} from '~/components/buttons/button'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getOrder} from '~/models/order.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {useLiveLoader} from '~/use-live-loader'
import {getAmountLeftToPay} from '~/utils'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const amountLeft = await getAmountLeftToPay(tableId)
  const tipPercentages = await prisma.branch.findFirst({
    where: {table: {some: {id: tableId}}},
    select: {firstTip: true, secondTip: true, thirdTip: true},
  })
  const order = await getOrder(tableId)
  const total = order?.total

  const data = {amountLeft, tipPercentages, total, tableId}

  return json(data)
}

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()

  const {tableId} = params
  invariant(tableId, 'tableId no encontrado')
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const userId = await getUserId(request)

  const tipPercentage = formData.get('tipPercentage') as string

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

export default function FullPay() {
  const data = useLoaderData()
  const navigate = useNavigate()

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Pagar cuenta completa"
    >
      <BillAmount
        total={data.total}
        currency={data.currency}
        amountLeft={data.amountLeft}
        usersPaid={data.paidUsers}
        userId={data.userId}
        // isPaying={isPaying}
      />
      <Form method="POST" action={`/table/${data.tableId}/pay/action`}>
        <p>{data.amountLeft}</p>
        <FlexRow>
          {Object.values(data.tipPercentages).map((percentages: any, index) => (
            <label
              htmlFor={index.toString()}
              className="flex flex-col ring-2"
              key={index}
            >
              {percentages * 100}%{data.amountLeft * percentages}
              <input
                id={index.toString()}
                type="radio"
                name="tipPercentage"
                value={percentages}
                className="h-20 text-blue-200 bg-blue-200 "
              />
            </label>
          ))}
          {/* <label htmlFor="firstTip" className="flex flex-col ring-2">
            {data.tipPercentages?.firstTip * 100}%
            {data.amountLeft * data.tipPercentages?.firstTip}
            <input
              id="firstTip"
              type="radio"
              name="tipPercentage"
              value={data.tipPercentages?.firstTip}
              className="h-20 text-blue-200 bg-blue-200 "
              defaultChecked
            />
          </label>
          <label htmlFor="secondTip" className="flex flex-col ring-2">
            {data.tipPercentages?.secondTip * 100}%{'  '}$
            {data.amountLeft * data.tipPercentages?.secondTip}
            <input
              id="secondTip"
              type="radio"
              name="tipPercentage"
              value={data.tipPercentages?.secondTip}
              className="h-20 text-blue-200 bg-blue-200 "
            />
          </label>
          <label htmlFor="thirdTip" className="flex flex-col ring-2">
            {data.tipPercentages?.thirdTip * 100}%
            {data.amountLeft * data.tipPercentages?.thirdTip}
            <input
              id="thirdTip"
              type="radio"
              name="tipPercentage"
              value={data.tipPercentages?.thirdTip}
              className="h-20 text-blue-200 bg-blue-200 "
            />
          </label>
          <label htmlFor="noTip" className="flex flex-col ring-2">
            0%
            <input
              id="noTip"
              type="radio"
              name="tipPercentage"
              value={0}
              className="h-20 text-blue-200 bg-blue-200 "
            />
          </label> */}
        </FlexRow>
        <Button name="payAction">Pay</Button>
      </Form>
    </Modal>
  )
}
