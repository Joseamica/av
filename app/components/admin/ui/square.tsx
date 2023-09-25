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
        className="flex items-center justify-center w-24 h-24 p-1 text-sm break-all bg-white border shadow hover:bg-button-primary hover:text-white rounded-2xl"
        preventScrollReset
      >
        <div className="flex flex-col items-center space-y-2 text-center">{name}</div>
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
