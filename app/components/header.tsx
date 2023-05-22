import type {User} from '@prisma/client'
import {Link, useParams} from '@remix-run/react'
import {LinkButton} from './buttons/button'
import {FlexRow} from './util/flexrow'
import {H1} from './util/typography'
interface HeaderProps {
  user: User
}

export function Header({user}: HeaderProps) {
  const params = useParams()

  return (
    <FlexRow
      justify="between"
      className="z-100 sticky top-0  bg-day-500 p-2 text-white"
    >
      {params.menuId ? (
        <Link to={''}>{'<'}</Link>
      ) : (
        <Link to=".">
          <H1>Avoqado</H1>
        </Link>
      )}
      <LinkButton to={`user/${user.id}`} size="small">
        {user.name}
      </LinkButton>
    </FlexRow>
  )
}
