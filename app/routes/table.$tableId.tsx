import {json} from '@remix-run/node'
import {Outlet} from '@remix-run/react'
import type {DataFunctionArgs} from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {getBranch} from '~/models/branch.server'
import {validateUserIntegration} from '~/models/validations.server'
import {getSession} from '~/session.server'

export async function loader({request, params}: DataFunctionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró el ID de la mesa')
  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const session = await getSession(request)
  const userId = session.get('userId')
  const username = session.get('username')

  if (userId && username) {
    const userValidations = await validateUserIntegration(
      userId,
      tableId,
      username,
    )
    return json({success: true}) // return json({success: true})
  } else {
    return json({success: false})
  }
}

export default function TableIndex() {
  // const revalidator = useRevalidator()
  // useEffect(() => {
  //   revalidator.revalidate()
  // }, [])

  return (
    <div>
      <Outlet />
    </div>
  )
}
