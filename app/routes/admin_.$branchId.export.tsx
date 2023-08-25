import { type ActionArgs } from '@remix-run/node'

import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'

export async function loader({ request, params }: ActionArgs) {
  const { branchId } = params
  const searchParams = getSearchParams({ request })
  const dataType = searchParams.get('dataType')
  let csv = null
  switch (dataType) {
    case 'products':
      const products = await prisma.menuItem.findMany({ where: { branchId } })
      csv = convertToCSV(products)
      break
    case 'categories':
      const categories = await prisma.menuCategory.findMany({ where: { branchId } })
      csv = convertToCSV(categories)
      break
  }

  // Your logic to convert products to CSV

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=${dataType}.csv`,
    },
  })
}

function convertToCSV(objArray) {
  const array = objArray
  let csv = ''

  // Extract header (keys from the first object)
  const header = Object.keys(array[0])
  csv += header.join(',') + '\r\n'

  // Extract values from each object
  for (let i = 0; i < array.length; i++) {
    let line = ''
    for (let key of header) {
      if (line !== '') line += ','

      // Escape double quotes by doubling them and wrap the value in double quotes
      let value = array[i][key] === null ? '' : array[i][key]
      value = value.toString().replace(/"/g, '""')
      line += `"${value}"`
    }
    csv += line + '\r\n'
  }

  return csv
}
