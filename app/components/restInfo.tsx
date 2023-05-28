import {BookOpenIcon} from '@heroicons/react/outline'
import {Link, useLoaderData} from '@remix-run/react'
import {Spacer} from './util/spacer'

export function RestaurantInfoCard() {
  const data = useLoaderData()
  return (
    <main className="px-1 pt-4">
      <div className="relative " id="container">
        <img
          src={data.branch.ppt_image}
          alt=""
          loading="lazy"
          className="dark:bg-secondaryDark relative max-h-40 w-full rounded-3xl bg-day-bg_principal object-cover brightness-50 dark:bg-night-bg_principal dark:text-night-text_principal"
        />
        <div className="absolute bottom-5 left-5">
          <p className="text-sm tracking-widest text-white">
            {data.branch.cuisine.toUpperCase()}
          </p>
          <p className="text-2xl font-normal tracking-wider text-white">
            {data.branch.name}
          </p>
          <p className="text-white">
            {data.branch.address.length > 40
              ? data.branch.address.substring(0, 40) + '...'
              : data.branch.address}
          </p>
          <p className="text-white">{data.branch.city}</p>
        </div>
      </div>
      <Spacer size="md" />
      {data.menu?.id ? (
        <Link
          to={`menu/${data.menu?.id}`}
          className="dark:bg-mainDark dark:text-mainTextDark flex items-center justify-between rounded-full bg-day-bg_principal px-6 py-4 text-lg drop-shadow-xl dark:bg-night-bg_principal  dark:text-night-text_principal"
        >
          <BookOpenIcon className="h-6 w-6" />
          <span>Ver la carta</span>
          <div />
        </Link>
      ) : (
        <p className="rounded-full px-4 py-4 text-center text-sm ring-1">
          {data.error}
        </p>
      )}
    </main>
  )
}
