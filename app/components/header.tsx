import { Link, useLocation, useMatches } from '@remix-run/react'

import type { User } from '@prisma/client'
import clsx from 'clsx'

import { ChevronLeftIcon, SearchIcon, UserCircleIcon } from './icons'
import { BackButton } from './ui/buttons/back-button'
import { LinkButton } from './ui/buttons/button'
import { FlexRow } from './util/flexrow'
import { H1, H5 } from './util/typography'

import { getUrl } from '~/utils'

interface HeaderProps {
  user: User
  isAdmin: boolean
}

export function Header({ user, isAdmin }: HeaderProps) {
  const location = useLocation()
  const isTablePathOnly = location.pathname.split('/').length <= 3

  return (
    <nav
      className={`dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal fixed inset-x-0 top-0 z-30 m-auto flex w-full max-w-md flex-row items-center justify-between rounded-b-2xl bg-day-bg_principal p-3 drop-shadow-md sm:rounded-none`}
    >
      {!isAdmin ? (
        <>
          {!isTablePathOnly ? (
            <Link to={`${location.pathname.split('/')[2]}`} className="flex items-center justify-center rounded-full shadow-md h-7 w-7">
              <ChevronLeftIcon />
            </Link>
          ) : (
            <Link to=".">
              <H1>Avoqado</H1>
            </Link>
          )}
          {location.pathname.includes('menu') ? (
            <FlexRow className="space-x-4">
              <LinkButton to={`table/${location.pathname.split('/')[2]}/user/${user.id}`} size="small">
                <i>
                  <UserCircleIcon className="w-5 h-5" fill={user.color || '#fff'} />
                </i>
                <H5>{user.name}</H5>
              </LinkButton>
              <Link
                to={`${location.pathname}/search`}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray_light bg-white p-1 shadow-md`}
              >
                <SearchIcon className="w-5 h-5" />
              </Link>
            </FlexRow>
          ) : (
            <LinkButton to={`${location.pathname.split('/')[2]}/user/${user.id}`} size="small">
              <i>
                <UserCircleIcon className="w-5 h-5" fill={user.color || '#fff'} />
              </i>
              <H5>{user.name}</H5>
            </LinkButton>
          )}
        </>
      ) : (
        <FlexRow>
          <Link to=".">
            <H1>Avoqado</H1>
          </Link>
          <LinkButton to={`/admin`} size="small">
            Admin
          </LinkButton>
        </FlexRow>
      )}
    </nav>
  )
}

export function HeaderV2({ user }: { user: User }) {
  const pathname = useLocation().pathname
  const matches = useMatches()
  const backButton = matches.find(match => match.handle)?.handle.backButton
  const searchButton = matches.find(match => match.handle)?.handle.searchButton
  const path = matches.find(match => match.handle)?.handle.path

  const userProfile = getUrl('userProfile', pathname, { userId: user.id })
  const mainPath = getUrl('main', pathname)
  const back = getUrl('back', pathname)
  const search = getUrl('search', pathname)

  const headerPositions = {
    left: backButton ? (
      <BackButton url={back} />
    ) : (
      <Link to={mainPath}>
        <H1>Avoqado</H1>
      </Link>
    ),
    center: '',
    right: (
      <FlexRow>
        {searchButton && (
          <Link
            to={search}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray_light bg-white p-1 shadow-md`}
          >
            <SearchIcon className="w-5 h-5" />
          </Link>
        )}
        <LinkButton to={userProfile} size="small" custom="border-2" variant="custom">
          <UserCircleIcon className="w-5 h-5" fill={user.color || '#fff'} />
          <H5>{user.name}</H5>
        </LinkButton>
      </FlexRow>
    ),
  }

  return (
    <nav
      className={clsx(
        `fixed inset-x-0 top-0 z-30 mx-auto items-center 
       flex w-full max-w-md flex-row justify-between rounded-b-2xl bg-day-bg_principal
       p-3 drop-shadow-md sm:rounded-none`,
        {
          hidden: path === 'menu',
        },
      )}
    >
      {headerPositions.left}
      {headerPositions.center}
      {headerPositions.right}
    </nav>
  )
}
