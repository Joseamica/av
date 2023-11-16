import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'

import { getBranchId } from '~/models/branch.server'

import { FlexRow, H2, H4, Modal } from '~/components'

export async function action({ request }: ActionArgs) {
  const session = await getSession(request)
  session.flash('notification', '🎉 Se ha copiado la clave de la red wifi')

  return json({ success: true }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } })
}
export async function loader({ params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const branchId = await getBranchId(tableId)
  const wifiDetails = await prisma.branch.findFirst({
    where: { id: branchId },
    select: { wifiName: true, wifiPwd: true },
  })

  return json({ wifiDetails })
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Wifi" onClose={onClose}>
      <fetcher.Form className="flex flex-col p-5 space-y-4 text-xl text js-copy-to-clip" method="POST">
        <div className="flex flex-col items-center justify-between space-y-1">
          <H4>Nombre de red:</H4>
          <H2 className="px-4 py-2 border rounded-xl">{data.wifiDetails.wifiName}</H2>
        </div>
        <div className="flex flex-col items-center justify-between space-y-1 ">
          <H4>Clave:</H4>
          <FlexRow className="items-center p-2 space-x-2 border rounded-xl">
            <H2>{data.wifiDetails.wifiPwd}</H2>
            <button
              onClick={() => navigator.clipboard.writeText(data.wifiDetails.wifiPwd)}
              className="flex flex-row items-center px-2 py-1 space-x-2 text-sm text-white rounded-xl bg-principal border-button-outline bg-button-primary"
            >
              Copiar
            </button>
          </FlexRow>
        </div>
      </fetcher.Form>
    </Modal>
  )
}
