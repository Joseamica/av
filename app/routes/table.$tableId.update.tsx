import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import invariant from 'tiny-invariant'

import {updateIssue} from '~/data'
import {EVENTS} from '~/events'

export const action = async ({params, request}: ActionArgs) => {
  const updates = Object.fromEntries(await request.formData())
  console.log('updates', updates)
  invariant(params.id, 'Missing issue id')
  const result = await updateIssue(params.id, updates)

  EVENTS.TABLE_CHANGED(params.id)

  return json(result)
}
