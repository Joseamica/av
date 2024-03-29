import { Link } from '@remix-run/react'
import { UserCircleIcon } from '~/components/icons'

export function UserButton({ userColor, path, ...buttonProps }: { userColor: string | null; path: string }) {
  return (
    <Link {...buttonProps} to={path}>
      <UserCircleIcon fill={userColor ?? 'black'} className="bg-red min-h-10 min-w-10 h-8 w-8" />
    </Link>
  )
}
