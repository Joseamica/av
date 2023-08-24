import { Link } from '@remix-run/react'

import { DeleteIcon, H2, H5, Spacer } from '..'
import { EditIcon } from '../icons'

const formatCamelCase = str => {
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2')
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const DataTable = ({ items, keysToShow, title, editType, deleteType, setSearchParams, addPath }) => {
  return (
    <div>
      <H2>{title}</H2>
      <H5 variant="secondary">
        Want to add more {title.toLowerCase()}? <Link to={addPath}>Click here</Link>
      </H5>
      <Spacer size="sm" />
      {items.length > 0 ? (
        <table className="min-w-full bg-white border border-zinc-200 rounded-2xl">
          <thead>
            <tr>
              {keysToShow.map((col, index) => (
                <th key={index} className="border-b border-zinc-200 p-2 text-center bg-zinc-200 text-zinc-500">
                  {formatCamelCase(col)}
                </th>
              ))}
              <th className="border-b border-zinc-200 p-2 text-center bg-zinc-200 text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                {keysToShow.map((row, index) => (
                  <td key={index} className="border-b border-zinc-200 p-2">
                    <div className="flex flex-row justify-center items-center space-x-2">
                      {typeof item[row] === 'boolean' ? (item[row] ? 'True' : 'False') : item[row]}
                    </div>
                  </td>
                ))}
                <td>
                  <div className="justify-center flex space-x-2">
                    <button
                      onClick={() => {
                        setSearchParams({ editSubItem: item.id, editType })
                      }}
                      className="icon-button"
                    >
                      <EditIcon className="icon-size" />
                    </button>
                    <button
                      onClick={() => {
                        setSearchParams({ deleteSubItem: item.id, deleteType })
                      }}
                      className="icon-button"
                    >
                      <DeleteIcon className="icon-size" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No items to show</div>
      )}
    </div>
  )
}
