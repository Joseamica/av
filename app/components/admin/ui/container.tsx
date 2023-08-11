import { Link } from '@remix-run/react'
import { FaEdit } from 'react-icons/fa'

export default function Container({ name, accessQuery, editQuery }) {
  return (
    <div className="flex flex-col space-y-2 items-center">
      <Link to={accessQuery} className="w-24 h-24  flex justify-center items-center bg-white rounded-xl shadow">
        {name}
      </Link>
      <Link
        to={editQuery}
        className="text-zinc-400 flex-row space-x-2 text-violet11 shadow-blackA7 hover:bg-mauve3 flex h-[35px] items-center justify-center rounded-full bg-white px-[15px] font-medium leading-none  focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none border-2"
      >
        <FaEdit />
        {/* <p>Edit</p> */}
      </Link>
    </div>
  )
}
