import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'

import {EVENTS} from '~/events'

export const action = async ({params, request}: ActionArgs) => {
  const updates = Object.fromEntries(await request.formData())
  invariant(params.tableId, 'Missing issue id')
  const result = await prisma.table.findMany({})

  EVENTS.TABLE_CHANGED(params.tableId)

  return json(result)
}
