import { Link, useNavigate, useSearchParams } from '@remix-run/react'

import { DeleteIcon, EditIcon } from '~/components/icons'
import { FlexRow } from '~/components/util/flexrow'

export function Square({
  to,
  name,
  itemId,
  editIsRoute = false,
  ...rest
}: {
  to: string
  name: string | JSX.Element
  itemId: string
  editIsRoute?: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const handleEdit = () => {
    if (editIsRoute) {
      navigate(to)
    } else {
      searchParams.set('editItem', itemId)
      setSearchParams(searchParams)
    }
  }

  return (
    <FlexRow key={itemId} {...rest}>
      <Link
        to={to}
        className="w-24 h-24 hover:bg-button-primary hover:text-white flex justify-center items-center bg-white break-all rounded-2xl border shadow text-sm p-1"
      >
        <div className="flex flex-col space-y-2 items-center text-center">{name}</div>
      </Link>
      <div className="basic-flex-col">
        <button className="icon-button " onClick={handleEdit}>
          <EditIcon />
        </button>
        <button
          className="icon-button "
          onClick={() => {
            searchParams.set('deleteItem', itemId)
            setSearchParams(searchParams)
          }}
        >
          <DeleteIcon />
        </button>
      </div>
    </FlexRow>
  )
}
