import { useSearchParams } from '@remix-run/react'
import { IoPencil } from 'react-icons/io5'

import { XIcon } from '~/components/icons'
import { FlexRow } from '~/components/util/flexrow'
import { Spacer } from '~/components/util/spacer'
import { H1, H3 } from '~/components/util/typography'

const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
}

interface ItemProps {
  title: string
  itemToMap: any[] | object
  queryValue?: string
  params?: string[]
}
export default function Item({ title, itemToMap, queryValue, params }: ItemProps) {
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'No tiene ningún valor asignado'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return value
  }

  const cols = params?.length ?? 0
  const [searchParams, setSearchParams] = useSearchParams()
  if (Array.isArray(itemToMap)) {
    return (
      <div>
        <FlexRow justify="between">
          <H1>{title}</H1>
          <FlexRow>
            <button
              type="button"
              onClick={() => {
                searchParams.set('editSub', queryValue)
                setSearchParams(searchParams)
              }}
              className="flex-2 rounded-full border-2 bg-white px-4 py-2"
            >
              <p>Edit</p> <IoPencil className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                searchParams.set('showDel', 'true')
                setSearchParams(searchParams)
              }}
              className="flex-2 rounded-full border-2 bg-white px-4 py-2"
            >
              <p>Delete</p> <XIcon className="w-6 h-6" />
            </button>
          </FlexRow>
        </FlexRow>
        <Spacer size="sm" />
        {itemToMap?.length > 0 ? (
          <div className="border rounded-xl shadow-lg">
            <div className={`grid ${COLS[cols]} text-center border-b p-2 bg-gray-100 text-gray-600 rounded-t-xl`}>
              {params.map((param, index) => (
                <div key={index} className="font-medium">
                  {param}
                </div>
              ))}
            </div>
            {itemToMap.map(item => (
              <div key={item.id} className={`grid ${COLS[cols]} text-center border-b p-2`}>
                {params.map((param, index) => (
                  <div key={index}>
                    {item[param] ? <p>{renderValue(item[param])}</p> : <p className="text-red-500">No {param} found</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div>no hay nada que mostrar</div>
        )}
      </div>
    )
  } else if (itemToMap) {
    return (
      <div>
        <H1>{title}</H1>
        <div className="border rounded-xl shadow-lg">
          <div className={`grid ${COLS[params.length]} text-center border-b p-2 bg-gray-100 text-gray-600 rounded-t-xl`}>
            {params.map((param, index) => (
              <div key={index} className="font-medium">
                {param}
              </div>
            ))}
          </div>
          {params.map((param, index) => (
            <div key={index} className={`grid ${COLS[params.length]} text-center border-b p-2`}>
              {itemToMap[param] !== undefined ? <p>{renderValue(itemToMap[param])}</p> : <p className="text-red-500">No {param} found</p>}
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    return null
  }
}
