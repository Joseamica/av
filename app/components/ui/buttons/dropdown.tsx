import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useSearchParams } from '@remix-run/react'
import React from 'react'
import { FaHamburger } from 'react-icons/fa'
import { IoTrash } from 'react-icons/io5'

import { CheckIcon, ChevronRightIcon, HamburgerIcon, MenuIcon, XIcon } from '~/components/icons'
import { H4 } from '~/components/util/typography'

export function DropDown({ data }) {
  const [bookmarksChecked, setBookmarksChecked] = React.useState(true)
  const [urlsChecked, setUrlsChecked] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="grid-start-4 flex items-center space-x-2 rounded-full border-2 bg-white px-4 py-2"
          aria-label="Customise options"
        >
          <H4>Actions</H4>
          <MenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onClick={() => {
              searchParams.set('addSubItem', 'category')
              setSearchParams(searchParams)
            }}
            className="group cursor-pointer text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
          >
            Add category
            {/* <div className="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">⌘+T</div> */}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              searchParams.set('addSubItem', 'availabilities')
              setSearchParams(searchParams)
            }}
            className="group  cursor-pointer text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
          >
            Add availability
            {/* <div className="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">⌘+N</div> */}
          </DropdownMenu.Item>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[state=open]:bg-violet4 data-[state=open]:text-violet11 data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 data-[highlighted]:data-[state=open]:bg-violet9 data-[highlighted]:data-[state=open]:text-violet1">
              Change menu
              <div className="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                <ChevronRightIcon />
              </div>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                sideOffset={2}
                alignOffset={-5}
              >
                {data.menus?.map(menu => (
                  <DropdownMenu.Item
                    className="group text-[13px] cursor-pointer  leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                    key={menu.id}
                    onClick={() => {
                      searchParams.set('itemId', menu.id)
                      setSearchParams(searchParams)
                    }}
                  >
                    {menu.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="h-[1px] bg-violet6 m-[5px]" />
          {/* <DropdownMenu.Label className="pl-[25px] text-xs leading-[25px] text-mauve11">Actions</DropdownMenu.Label> */}
          <DropdownMenu.Item
            className="group text-[13px] cursor-pointer leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
            onClick={() => {
              searchParams.set('editItem', searchParams.get('itemId'))
              setSearchParams(searchParams)
            }}
          >
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="group text-[13px] cursor-pointer leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
            onClick={() => {
              searchParams.append('showDel', 'true')
              setSearchParams(searchParams)
            }}
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
