import { Link } from '@remix-run/react'
import React from 'react'

import { ChevronLeftIcon, PlusIcon } from '~/components/icons'
import { FlexRow } from '~/components/util/flexrow'

export default function HeaderSection({ backPath, title, addQuery }) {
  return (
    <FlexRow className="flex justify-between w-full">
      <div className="flex items-center">
        <Link to={backPath}>
          <ChevronLeftIcon className="w-12 h-12" />
        </Link>
        <h1 className="text-3xl font-bold">{title}</h1>
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
