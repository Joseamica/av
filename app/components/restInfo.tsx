import {Link} from '@remix-run/react'
import {Spacer} from './util/spacer'
import type {Branch, Menu, Table} from '@prisma/client'
import {BookOpenIcon} from '@heroicons/react/outline'

export function RestaurantInfoCard({
  branch,
  // tableId,
  menuId,
  errors,
}: {
  branch: Branch
  // tableId: Table['id']
  menuId: Menu['id']
  errors: string
}) {
  return (
    <main className="px-1 pt-4">
      <div className="relative " id="container">
        <img
          src={branch.ppt_image}
          alt=""
          loading="lazy"
          className="dark:bg-secondaryDark relative max-h-40 w-full rounded-3xl bg-white object-cover brightness-50"
        />
        <div className="absolute bottom-5 left-5">
          <p className="text-sm tracking-widest text-white">
            {branch.cuisine.toUpperCase()}
          </p>
          <p className="text-2xl font-normal tracking-wider text-white">
            {branch.name}
          </p>
          <p className="text-white">
            {branch.address.length > 40
              ? branch.address.substring(0, 40) + '...'
              : branch.address}
          </p>
          <p className="text-white">{branch.city}</p>
        </div>
      </div>
      <Spacer size="md" />
      {menuId ? (
        <Link
          to={`menu/${menuId}`}
          className="dark:bg-mainDark dark:text-mainTextDark flex items-center justify-between rounded-full bg-white px-6 py-4 text-lg drop-shadow-xl"
        >
          <BookOpenIcon className="h-6 w-6" />
          <span>Ver la carta</span>
          <div />
        </Link>
      ) : (
        <p className="rounded-full px-4 py-4 text-center text-sm ring-1">
          {errors}
        </p>
      )}
    </main>
  )
}
