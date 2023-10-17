import { useFetcher } from '@remix-run/react'
import React from 'react'

import { redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { getSearchParams } from '~/utils'

import { FlexRow, H1, H5 } from '~/components'

export async function loader({ request, params }) {
  const session = await getSession(request)
  const { branchId } = params

  const searchParams = getSearchParams({ request })
  const employeeId = searchParams.get('employeeId')

  if (!employeeId) return new Response('Not found', { status: 404 })

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, branchId },
  })

  if (!employee) return new Response('Not found', { status: 404 })

  if (employee.active) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { active: false },
    })
    return redirect(`/${branchId}/success?active=false&employeeId=${employeeId}`)
  } else {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { active: true },
    })
    return redirect(`/${branchId}/success?active=true&employeeId=${employeeId}`)
  }

  // // If the user has not visited before, set a cookie and return false
  // if (!hasVisited) {
  //   session.set('hasVisited', 'true')
  //   return new Response(JSON.stringify(false), {
  //     headers: { 'Content-Type': 'application/json' },
  //   })
  // }

  // // If the user has visited before, return true
  // return new Response(JSON.stringify(true), {
  //   headers: { 'Content-Type': 'application/json' },
  // })
}

// export default function WaiterControl() {
//   const [active, setActive] = React.useState(false)
//   const fetcher = useFetcher()
//   return (
//     <fetcher.Form method="POST" className="mx-auto flex">
//       <FlexRow>
//         <H1>Estado</H1>
//         <H5>{active ? 'Activo' : 'Inactivo'}</H5>
//       </FlexRow>
//     </fetcher.Form>
//   )
// }
