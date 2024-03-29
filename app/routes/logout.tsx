import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { logout } from '~/session.server'

import { getSearchParams } from '~/utils'

export const action = async ({ request }: ActionArgs) => {
  const searchParams = getSearchParams({ request })
  const redirectTo = searchParams.get('redirectTo')
  return logout(request, redirectTo)
}

export const loader = async () => redirect('/')
