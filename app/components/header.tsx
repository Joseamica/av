import type {User} from '@prisma/client'
import {Link, useLocation, useMatches} from '@remix-run/react'
import {IoChevronBack} from 'react-icons/io5'
import {LinkButton} from './buttons/button'
import {H1} from './util/typography'
interface HeaderProps {
  user: User
}

export function Header({user}: HeaderProps) {
  // const params = useParams()
  const location = useLocation()
  const isTablePathOnly = location.pathname.split('/').length <= 3
  // console.log('location', location)

  return (
    <nav className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal fixed inset-x-0 top-0 z-30 m-auto flex w-full max-w-md flex-row items-center justify-between rounded-b-2xl bg-day-bg_principal p-3 drop-shadow-md sm:rounded-none">
      {!isTablePathOnly ? (
        <Link
          to={`table/${location.pathname.split('/')[2]}`}
          className="flex h-7 w-7 items-center justify-center rounded-full shadow-md"
        >
          <IoChevronBack />
        </Link>
      ) : (
        <Link to=".">
          <H1>Avoqado</H1>
        </Link>
      )}
      <LinkButton to={`user/${user.id}`} size="small">
        {user.name}
      </LinkButton>
    </nav>
  )
}
