import { forwardRef, useRef } from 'react'

import { SearchIcon, XIcon } from '../icons'
import { FlexRow } from '../util/flexrow'

export const SearchBar = forwardRef(
  ({ setSearch, placeholder, search = '', ...rest }: { setSearch: Function; placeholder: string; search?: string }, ref) => {
    // Function to normalize input (remove accents)
    const normalizeInput = value => {
      // Using NFD and regex to strip off diacritics
      return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    // Function to handle input change
    const handleInputChange = e => {
      let value = e.target.value

      value = value.trim()
      value = value.toLowerCase()

      const normalizedValue = normalizeInput(value)
      setSearch(normalizedValue) // Updating search with normalized value
    }

    const clearSearch = () => {
      setSearch('')
      if (ref.current) {
        ref.current.value = '' // Clear the input field using the ref
      }
    }

    return (
      <div className="w-full bg-white border border-dashb-bg rounded-lg h-[40px] items-center flex flex-row pl-4">
        <FlexRow className="w-full">
          <SearchIcon className="w-5 h-5" />

          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="text"
            className="w-full h-full pl-2 outline-none"
            placeholder={placeholder}
            onChange={handleInputChange}
          />

          {/* Clear button */}
          {search && (
            <div className="pr-4">
              <button onClick={clearSearch} className="border rounded-full bg-[#fff8f8] h-6 w-6 flex justify-center items-center">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </FlexRow>
      </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'
