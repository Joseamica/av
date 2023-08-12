import { H1, H3 } from '~/components/util/typography'

function renderObject(object: any) {
  return Object.keys(object).map((key, index) => (
    <div key={index}>
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

export default function ItemInfo({
  title,
  orderObject,
}: {
  title: string
  orderObject: any // Changed from object to any
}) {
  if (!orderObject) return null // Return early if orderObject is undefined or null

  return (
    <div>
      <H3 boldVariant="bolder">{title}</H3>
      {renderObject(orderObject)}
    </div>
  )
}
