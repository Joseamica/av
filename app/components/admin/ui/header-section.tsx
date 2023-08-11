import { Link } from '@remix-run/react'

import { PlusIcon } from '~/components/icons'
import { FlexRow } from '~/components/util/flexrow'
import { H1, H3 } from '~/components/util/typography'

export default function HeaderSection({
  backPath,
  title,
  addQuery,
  breadcrumb,
}: {
  backPath: string
  title: string
  addQuery?: string
  breadcrumb?: string
}) {
  if (breadcrumb) {
    return (
      <FlexRow className="flex justify-between w-full">
        <div className="flex space-x-2 text-gray-500 items-center">
          {/* <Link to={backPath}>
            <ChevronLeftIcon className="w-12 h-12" />
          </Link> */}
          <Link to={backPath} className="text-blue-700 hover:underline text-ellipsis overflow-hidden">
            <H1>{title}</H1>
          </Link>
          <span>&gt;</span>
          <H3>{breadcrumb.substring(0, 15) + '...'}</H3>
        </div>
      </FlexRow>
    )
  }
  return (
    <FlexRow className="flex justify-between w-full">
      <div className="flex items-center">
        <H1>{title}</H1>
      </div>
      <div className="flex-grow" /> {/* This will push the Add button to the right */}
      <Link to={addQuery}>
        <FlexRow className="rounded-full border-2 bg-white px-4 py-2">
          Add <PlusIcon className="w-6 h-6" />
        </FlexRow>
      </Link>
    </FlexRow>
  )
}
