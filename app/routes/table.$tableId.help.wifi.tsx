import type {Employee, User} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, H2, H3, H6, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getBranchId} from '~/models/branch.server'
import {getTable} from '~/models/table.server'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const branchId = await getBranchId(tableId)
  const wifiDetails = await prisma.branch.findFirst({
    where: {id: branchId},
    select: {wifiName: true, wifipwd: true},
  })

  return json({wifiDetails})
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Wifi" onClose={onClose}>
      <div className="flex flex-col p-5 space-y-4 text-xl text js-copy-to-clip">
        <div className="flex flex-col items-center justify-between space-y-1">
          <H6>Nombre de red:</H6>
          <H2>{data.wifiDetails.wifiName}</H2>
        </div>
        <div className="flex flex-col items-center justify-between space-y-1 ">
          <H6>Clave:</H6>
          <FlexRow className="items-center space-x-2">
            <H2>{data.wifiDetails.wifipwd}</H2>
            <button
              onClick={() =>
                navigator.clipboard.writeText(data.wifiDetails.wifipwd)
              }
              className="flex flex-row items-center px-2 py-1 space-x-2 text-sm text-white rounded-full dark:bg-DARK_PRIMARY_1 bg-principal"
            >
              Copiar
            </button>
          </FlexRow>
        </div>
      </div>
    </Modal>
  )
}
