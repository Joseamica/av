import { useState } from 'react'

import { H1, H3 } from '~/components/util/typography'

export default function ItemInfo({
  title,
  itemObject,
}: {
  title: string
  itemObject: any // Changed from object to any
}) {
  if (!itemObject) return null // Return early if orderObject is undefined or null

  return (
    <div>
      <H3 boldVariant="bolder">{title}</H3>
      <CollapsibleItem item={itemObject} />
    </div>
  )
}

function CollapsibleItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 h-24 flex justify-center items-center bg-white break-all rounded-xl shadow text-sm p-1"
      >
        {item.name}
      </button>
      {isOpen && <div className="mt-2 bg-gray-100 p-4 rounded-xl border">{renderObject(item)}</div>}
    </div>
  )
}
function renderObject(object: any) {
  return Object.keys(object).map((key, index) => (
    <div key={index} className="bg-white">
      {typeof object[key] === 'object' && object[key] !== null ? (
        <>
          <H1>{key.charAt(0).toUpperCase() + key.slice(1)}</H1>
          <div className="bg-white p-2 rounded-xl border">{renderObject(object[key])}</div>
        </>
      ) : (
        <p>
          {key}: {object[key] === null ? 'empty' : typeof object[key] === 'boolean' ? object[key].toString() : object[key]}
        </p>
      )}
    </div>
  ))
}
