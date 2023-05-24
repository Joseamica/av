import type {User} from '@prisma/client'
import {Link, useLocation, useParams} from '@remix-run/react'
import {LinkButton} from './buttons/button'
import {FlexRow} from './util/flexrow'
import {H1} from './util/typography'
import {IoChevronBack} from 'react-icons/io5'
interface HeaderProps {
  user: User
}

export function Header({user}: HeaderProps) {
  // const params = useParams()
  const location = useLocation()
  const isTablePathOnly = location.pathname.split('/').length <= 3
  return (
    <nav className="dark:bg-mainDark fixed inset-x-0 top-0 z-30 m-auto flex  w-full max-w-md flex-row items-center justify-between rounded-b-2xl bg-white p-3 drop-shadow-md sm:rounded-none">
      {!isTablePathOnly ? (
        <Link to={''}>
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
