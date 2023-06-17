import type {User} from '@prisma/client'
import {Link, useLocation, useMatches} from '@remix-run/react'
import {IoChevronBack} from 'react-icons/io5'
import {LinkButton} from './buttons/button'
import {H1} from './util/typography'
import {FlexRow} from './util/flexrow'
import {SearchIcon} from '@heroicons/react/solid'
interface HeaderProps {
  user: User
  isAdmin: boolean
}

export function Header({user, isAdmin}: HeaderProps) {
  // const params = useParams()
  const location = useLocation()
  const isTablePathOnly = location.pathname.split('/').length <= 3

  return (
    <nav className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal fixed inset-x-0 top-0 z-30 m-auto flex w-full max-w-md flex-row items-center justify-between rounded-b-2xl bg-day-bg_principal p-3 drop-shadow-md sm:rounded-none">
      {!isAdmin ? (
        <>
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
          {location.pathname.includes('menu') ? (
            <FlexRow className="space-x-4">
              <LinkButton
                to={`table/${location.pathname.split('/')[2]}/user/${user.id}`}
                size="small"
              >
                {user.name}
              </LinkButton>
              <Link
                to={`${location.pathname}/search`}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray_light bg-white p-1 shadow-md`}
              >
                <SearchIcon className="h-5 w-5" />
              </Link>
            </FlexRow>
          ) : (
            <LinkButton
              to={`table/${location.pathname.split('/')[2]}/user/${user.id}`}
              size="small"
            >
              {user.name}
            </LinkButton>
          )}
        </>
      ) : (
        <FlexRow>
          <LinkButton to={`/admin`} size="small">
            Admin
          </LinkButton>
        </FlexRow>
      )}
    </nav>
  )
}
