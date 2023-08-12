import { H1, H3 } from '~/components/util/typography'

export default function Item({ title, itemToMap, params }: { title: string; itemToMap: any[] | object; params?: string[] }) {
  if (typeof itemToMap === 'string') {
    return <H3>{title + ': ' + itemToMap}</H3>
  }
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return 'No tiene ningún valor asignado'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return value
  }
  if (Array.isArray(itemToMap)) {
    return (
      <div>
        <H3 boldVariant="bolder">{title}</H3>
        {itemToMap?.length > 0 ? (
          <div>
            {itemToMap.map(item => (
              <div key={item.id} className="border">
                {params.map((param, index) => (
                  <div key={index}>
                    {item[param] ? (
                      <p>
                        {param}:{item[param]}
                      </p>
                    ) : (
                      <p className="text-red-500">No {param} found</p>
                    )}
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
        <div className="border">
          {params.map((param, index) => (
            <div key={index}>
              {itemToMap[param] !== undefined ? (
                <p>
                  {param}:{renderValue(itemToMap[param])}
                </p>
              ) : (
                <p className="text-red-500">No {param} found</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    return null
  }
}
