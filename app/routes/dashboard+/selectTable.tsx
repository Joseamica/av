import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Button, H3, Modal } from '~/components'
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
    <Modal onClose={() => navigate(-1)} title="Agregar">
      <div className="p-4">
        <H3>Ingresa la mesa</H3>
        <fetcher.Form method="POST" className="flex flex-row space-x">
          <input type="number" inputMode="numeric" name="table" className="w-full h-14" />
          <Button size="medium">Submit</Button>
        </fetcher.Form>
      </div>
      <ErrorList errors={[fetcher.data?.error]} />
    </Modal>
  )
}
