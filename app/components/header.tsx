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
    <FlexRow justify="between" className="p-2 text-white">
      {params.menuId ? <Link to={''}>{'<'}</Link> : <H1>Avoqado</H1>}
      <LinkButton to={`user/${user.id}`} size="small">
        {user.name}
      </LinkButton>
    </FlexRow>
  )
}
