import { Link } from '@remix-run/react'
import { FaEdit } from 'react-icons/fa'

import { EditIcon } from '~/components/icons'

export default function Container({ name, itemIdQuery, editQuery }: { name: string | number; itemIdQuery: string; editQuery: string }) {
  let displayText = ''
  if (String(name).startsWith('cll')) {
    displayText = String(name).slice(-4).toUpperCase()
  } else {
    displayText = String(name).toUpperCase()
  }

  return (
    <div className="flex flex-col space-y-2 items-center">
      <Link to={itemIdQuery} className="w-24 h-24 flex justify-center items-center bg-white break-all rounded-xl shadow text-sm p-1 ">
        <div className="text-center ">{displayText}</div>
      </Link>
      <Link
        to={editQuery}
        className="text-zinc-400 flex-row space-x-2 text-violet11 shadow-blackA7 hover:bg-mauve3 flex h-[35px] items-center justify-center rounded-full bg-white px-[15px] font-medium leading-none  focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none border-2"
      >
        <EditIcon />
        {/* <p>Edit</p> */}
      </Link>
    </div>
  )
}
