import { Form, useSearchParams } from '@remix-run/react'
import React from 'react'

import { SearchIcon } from '../icons'
import { FlexRow } from '../util/flexrow'

export function SearchBar({ setSearch, placeholder }: { setSearch: Function; placeholder: string }) {
  return (
    <div className="w-full bg-white border border-dashb-bg rounded-lg h-[40px] items-center flex flex-row pl-4">
      <FlexRow className="w-full">
        <SearchIcon className="h-5 w-5" />

        <input
          type="text"
          className="w-full h-full outline-none pl-2"
          placeholder={placeholder}
          onChange={e => setSearch(e.target.value)}
        />
      </FlexRow>
    </div>
  )
}
