import {json} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {H2} from '~/components'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getBranchId} from '~/models/branch.server'
import {useLiveLoader} from '~/use-live-loader'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  const table = await prisma.table.findMany({})
  return json({table})
}

export async function action({request, params}: ActionArgs) {
  // const formData = await request.formData()
  const {tableId} = params
  invariant(tableId, 'tableId no encontrado')
  const updates = Object.fromEntries(await request.formData())

  // const test = formData.get('test')
  const branchId = await getBranchId(tableId)
  const tables = await prisma.table.create({
    data: {
      table_number: 4,
      order_in_progress: false,
      branchId: branchId,
    },
  })

  console.log(
    '%c ',
    'font-size: 1px; padding: 215px 385px; background-size: 770px 430px; background: no-repeat url(https://i0.wp.com/i.giphy.com/media/ZVik7pBtu9dNS/giphy-downsized.gif?w=770&amp;ssl=1);',
  )
  EVENTS.TABLE_CHANGED(tableId)

  return json({tables})
}

export default function PAY() {
  const data = useLoaderData()

  return (
    <Form method="POST">
      {data.table.map(user => (
        <div key={user.id}>
          <H2>{user.table_number}</H2>
        </div>
      ))}
      {/* <input type="hidden" name="test" value="test" /> */}
      <button>SUBMIT</button>
    </Form>
  )
}
