import {UserCircleIcon} from '@heroicons/react/solid'
import {Link} from '@remix-run/react'

export function UserButton({
  userColor,
  path,
  ...buttonProps
}: {
  userColor: string | null
  path: string
}) {
  return (
    <Link {...buttonProps} to={path}>
      <UserCircleIcon
        fill={userColor ?? 'black'}
        className="bg-red min-h-10 min-w-10 h-8 w-8"
      />
    </Link>
  )
}
