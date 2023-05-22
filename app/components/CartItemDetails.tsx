import {Link} from '@remix-run/react'
import React from 'react'
import {FlexRow} from './util/flexrow'
import {H5} from './util/typography'
import type {CartItem} from '@prisma/client'

export function CartItemDetails({cartItem}: {cartItem: CartItem}) {
  return (
    <Link
      to={`cartItem/${cartItem.id}`}
      key={cartItem.id}
      className="flex flex-row items-center justify-between"
    >
      <FlexRow>
        <H5 className="flex items-center justify-center text-center h-7 w-7 bg-night-200">
          {cartItem.quantity}
        </H5>
        <img
          alt=""
          loading="lazy"
          src={cartItem?.image}
          className="w-10 h-10 rounded-lg dark:bg-secondaryDark"
        />
        <H5>{cartItem.name}</H5>
      </FlexRow>

      <H5 className="right-0">${cartItem.price}</H5>
    </Link>
  )
}
