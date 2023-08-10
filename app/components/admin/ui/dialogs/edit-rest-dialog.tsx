import { QueryDialog } from './dialog'

export function EditRestDialog() {
  return (
    <QueryDialog query="editRest" title="Restaurant" description="Make changes to your restaurant here. Click save when you're done.">
      <div className="mt-4">
        <label className="block">
          <span className="text-gray-700">Restaurant Name</span>
          <input
            type="text"
            className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
            placeholder="Restaurant Name"
          />
        </label>
      </div>
      <div className="mt-4">
        <label className="block">
          <span className="text-gray-700">Restaurant Logo</span>
          <input
            type="text"
            className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
            placeholder="Restaurant Logo"
          />
        </label>
      </div>
    </QueryDialog>
  )
}
