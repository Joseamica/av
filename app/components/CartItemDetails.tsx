import type {CartItem, User} from '@prisma/client'
import {Link, useLoaderData} from '@remix-run/react'
import {motion} from 'framer-motion'
import {formatCurrency} from '~/utils'
import {FlexRow} from './util/flexrow'
import {H4, H5, H6} from './util/typography'

const MotionLink = motion(Link)

interface CartItemDetailsProps extends CartItem {
  user: User[]
}

export function CartItemDetails({cartItem}: {cartItem: CartItemDetailsProps}) {
  const data = useLoaderData()
  let cartTotalPrice = cartItem.price * cartItem.quantity
  let users = cartItem.user?.slice(0, 2).map(user => user.name)
  if (cartItem.user?.length > 2) users.push('...')
  return (
    <MotionLink
      to={`cartItem/${cartItem.id}`}
      key={cartItem.id}
      preventScrollReset
      className="flex flex-row items-center justify-between py-2"
      id="userDetails"
      // initial={{height: 0, opacity: 0}}
      // animate={{height: 'auto', opacity: 1}}
      // exit={{height: 0, opacity: 0}}
      // transition={{
      //   height: {duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98]},
      //   opacity: {duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98]},
      //   paddingTop: {duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98]},
      //   paddingBottom: {duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98]},
      // }}
    >
      <FlexRow>
        <H6 className="flex h-5 w-5 items-center justify-center rounded-lg text-center">
          {cartItem.quantity}
        </H6>
        <img
          alt=""
          loading="lazy"
          src={cartItem?.image || ''}
          className="dark:bg-secondaryDark h-10 w-10 rounded-lg"
        />
        <div className="space-y-[2px]">
          {cartItem.quantity > 1 ? (
            <H5>{cartItem.name}</H5>
          ) : (
            <H4>{cartItem.name}</H4>
          )}
          <H6 className="">{users?.join(', ')}</H6>
        </div>
      </FlexRow>
      <FlexRow className="shrink-0">
        {cartItem.quantity > 1 && (
          <H6 variant="secondary" boldVariant="light">
            {formatCurrency(data.currency, Number(cartItem?.price))}
          </H6>
        )}

        <H4 boldVariant="medium">
          {formatCurrency(data.currency, cartTotalPrice)}
        </H4>
      </FlexRow>
    </MotionLink>
  )
}
