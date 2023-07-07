import {BookOpenIcon} from '@heroicons/react/outline'
import {Link} from '@remix-run/react'

import type {Branch, Menu} from '@prisma/client'

export function RestaurantInfoCard({
  branch,
  menu,
  error,
}: {
  branch: Branch
  menu: Menu
  error: string
}) {
  return (
    <main className="px-1 pt-4">
      <div className="relative " id="container">
        <img
          src={branch.ppt_image}
          alt=""
          loading="lazy"
          className="dark:bg-secondaryDark dark:bg-night-bg_principal dark:text-night-text_principal relative max-h-40 w-full rounded-t-3xl bg-day-bg_principal object-cover brightness-50"
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
      {/* <Spacer size="md" /> */}
      {menu?.id ? (
        <Link
          to={`menu/${menu?.id}`}
          className="dark:bg-mainDark dark:text-mainTextDark dark:bg-night-bg_principal dark:text-night-text_principal flex items-center justify-between rounded-b-3xl bg-day-bg_principal px-6 py-4 text-lg  drop-shadow-xl"
        >
          <BookOpenIcon className="h-6 w-6" />
          <span>Ver la carta</span>
          <div />
        </Link>
      ) : (
        <p className="rounded-full px-4 py-4 text-center text-sm ring-1">
          {error}
        </p>
      )}
    </main>
  )
}
