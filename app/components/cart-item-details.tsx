import type { User } from '@prisma/client'
import { Link, useLoaderData } from '@remix-run/react'
import { motion } from 'framer-motion'
import { formatCurrency } from '~/utils'
import { FlexRow } from './util/flexrow'
import { H5, H6 } from './util/typography'
import { UserCircleIcon } from './icons'

const MotionLink = motion(Link)

export function CartItemDetails({ cartItem }: { cartItem: any }) {
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
        <H6 className="flex h-4 w-4 items-center justify-center rounded-md bg-button-notSelected text-center">{cartItem.quantity}</H6>
        <img alt="" loading="lazy" src={cartItem?.image || ''} className="dark:bg-secondaryDark h-10 w-10 rounded-lg" />
        <div className="space-y-[2px]">
          {cartItem.quantity > 1 ? <H5 className="text-md">{cartItem.name}</H5> : <H5>{cartItem.name}</H5>}
          {cartItem.user?.length > 0 && (
            <FlexRow className="w-full">
              {cartItem.user.map((user: User) => (
                <div key={user.id} className="flex flex-row items-center space-x-1">
                  <UserCircleIcon fill={user.color || '#000'} className="min-h-5  min-w-5 h-5" />
                  <H6 className="">{user.name}</H6>
                </div>
              ))}
            </FlexRow>
          )}
        </div>
      </FlexRow>
      <FlexRow className="shrink-0">
        {cartItem.quantity > 1 && (
          <H6 variant="secondary" boldVariant="light">
            {formatCurrency(data.currency, Number(cartItem?.price))}
          </H6>
        )}

        <H5 boldVariant="medium">{formatCurrency(data.currency, cartTotalPrice)}</H5>
      </FlexRow>
    </MotionLink>
  )
}
