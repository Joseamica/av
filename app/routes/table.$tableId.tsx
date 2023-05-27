import type {Table} from '@prisma/client'
import {json} from '@remix-run/node'
import {Link, Outlet, useLoaderData} from '@remix-run/react'
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
  const sessionId = session.get('sessionId')
  if (!sessionId) {
    throw new Error('No se encontró el ID de la sesión')
  }
  const userId = session.get('userId')
  const username = session.get('username')
  const user = await prisma.user.findFirst({where: {id: userId}})
  const tables = await prisma.table.findMany({
    where: {branchId: branch.id},
  })

  if (userId && username) {
    const userValidations = await validateUserIntegration(
      userId,
      tableId,
      username,
    )
    return json({user, tables}) // return json({success: true})
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
      {/* {data.tables.map((table: Table) => (
        <Link
          key={table.id}
          to={`/table/${table.id}`}
          className="bg-blue-200 p-2"
        >
          {table.table_number}
        </Link>
      ))} */}
      <Outlet />
    </div>
  )
}
