import { Link } from '@remix-run/react'

import { ChevronLeftIcon } from '../../icons'

export function BackButton({ url }: { url: string }) {
  return (
    <Link to={url} className="rounded-full border">
      <ChevronLeftIcon className="h-8 w-8" />
    </Link>
  )
}
