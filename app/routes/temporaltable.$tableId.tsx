import type {Table} from '@prisma/client'
import {json} from '@remix-run/node'
import {Link, Outlet, useLoaderData, useLocation} from '@remix-run/react'
import type {DataFunctionArgs} from '@remix-run/server-runtime'
import {useEventSource, useSubscribe} from 'remix-sse/client'
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
  // if (!sessionId) {
  //   throw new Error('No se encontró el ID de la sesión')
  // }
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
  // useEventSource('/SSE')

  // const greetings = useSubscribe('/SSE', 'total')
  // const questions = useSubscribe('/SSE', 'question')

  // const mostRecentGreeting = useSubscribe('/SSE', 'greeting', {
  //   returnLatestOnly: true,
  // })

  return (
    <div>
      <Header user={data.user} />
      {/* <div style={{fontFamily: 'system-ui, sans-serif', lineHeight: '1.4'}}>
        <h1>Welcome to Remix-SSE</h1>

        <h2>Greetings:</h2>
        {JSON.stringify(greetings)}

        <h2>Questions:</h2>
        {JSON.stringify(questions)}

        <h2>Most Recent Greeting:</h2>
        {JSON.stringify(mostRecentGreeting)}
      </div> */}
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
