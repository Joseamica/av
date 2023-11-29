import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Button, H3, Modal, Spacer } from '~/components'
import { ErrorList } from '~/components/forms'

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const formData = await request.formData()
  const tableNumber = formData.get('table') as string
  const table = await prisma.table.findFirst({
    where: {
      branchId,
      number: Number(tableNumber),
    },
  })

  if (!table) {
    return json({ error: 'No existe la mesa' })
  }
  return redirect(`/dashboard/actions/${table.id}`)
}

export default function Name() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  return (
    <Modal onClose={() => navigate(-1)} title="Ingresa a la mesa para agregar productos">
      <div className="px-4 py-7">
        <H3 className="pl-4">Ingresa # de mesa</H3>
        <Spacer spaceY="1" />
        <fetcher.Form method="POST" className="flex flex-row space-x relative">
          <input
            type="number"
            inputMode="numeric"
            name="table"
            className="flex flex-row items-center self-end  px-4 py-2 border-2 h-14 rounded-full bg-componentBg dark:bg-DARK_0 w-full"
          />
          <button className="absolute right-0 flex items-center justify-center h-14 w-20 rounded-full bg-day-principal text-white">
            Submit
          </button>
        </fetcher.Form>
      </div>
      <ErrorList errors={[fetcher.data?.error]} />
    </Modal>
  )
}
