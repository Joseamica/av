import type {CartItem} from '@prisma/client'
import {Link} from '@remix-run/react'
import {FlexRow} from './util/flexrow'
import {H4, H5} from './util/typography'

export function CartItemDetails({cartItem}: {cartItem: CartItem}) {
  return (
    <Link
      to={`cartItem/${cartItem.id}`}
      key={cartItem.id}
      className="flex flex-row items-center justify-between"
    >
      <FlexRow>
        <H5 className="flex h-6 w-6 items-center justify-center rounded-lg bg-night-200 text-center">
          {cartItem.quantity}
        </H5>
        <img
          alt=""
          loading="lazy"
          src={cartItem?.image || ''}
          className="dark:bg-secondaryDark h-10 w-10 rounded-lg"
        />
        <H4>{cartItem.name}</H4>
      </FlexRow>

      <H5 className="right-0">${cartItem.price}</H5>
    </Link>
  )
}
