import {json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import type {DataFunctionArgs} from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import {Header} from '~/components'
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
  const user = await prisma.user.findUnique({where: {id: userId}})

  if (userId && username) {
    const userValidations = await validateUserIntegration(
      userId,
      tableId,
      username,
    )
    return json({user}) // return json({success: true})
  } else {
    return json({success: false})
  }
}

export default function TableIndex() {
  // const revalidator = useRevalidator()
  // useEffect(() => {
  //   revalidator.revalidate()
  // }, [])
  const data = useLoaderData()

  return (
    <div>
      <Header user={data.user} />

      <Outlet />
    </div>
  )
}
