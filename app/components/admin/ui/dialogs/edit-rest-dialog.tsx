import { QueryDialog } from './dialog'

export function EditRestDialog() {
  return (
    <QueryDialog query="editChain" title="Chain" description="Make changes to your chain here. Click save when you're done.">
      <div className="mt-4">
        <label className="block">
          <span className="text-gray-700">Chain Name</span>
          <input
            type="text"
            className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
            placeholder="Chain Name"
          />
        </label>
      </div>
      {/* <div className="mt-4">
        <label className="block">
          <span className="text-gray-700">Chain Logo</span>
          <input
            type="text"
            className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
            placeholder="Chain Logo"
          />
        </label>
      </div> */}
    </QueryDialog>
  )
}
