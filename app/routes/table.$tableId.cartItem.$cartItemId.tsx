import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {json} from '@remix-run/node'
import {H1, H2, H4, H5, Modal} from '~/components'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {User} from '@prisma/client'

export async function loader({request, params}: LoaderArgs) {
  const {tableId, cartItemId} = params
  invariant(tableId, 'No se encontró la mesa')
  invariant(cartItemId, 'No se encontró el ID del item')

  const cartItem = await prisma.cartItem.findUnique({
    where: {id: cartItemId},
    include: {user: true},
  })
  return json({cartItem})
}

export default function CartItemId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal onClose={onClose} title={data.cartItem.name}>
      <div>
        <H1>Compartido por:</H1>
        {data.cartItem.user.map((user: User) => (
          <div key={user.id}>
            <H5>{user.name}</H5>
          </div>
        ))}
        <H4>{data.cartItem.name}</H4>
      </div>
    </Modal>
  )
}
