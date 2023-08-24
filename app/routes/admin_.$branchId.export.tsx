import { ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'

// export async function action({ request, params }: LoaderArgs) {
//   const products = await prisma.menuItem.findMany({})

//   // Your logic to convert products to CSV
//   const csv = convertToCSV(products)

//   return json(csv, {
//     headers: {
//       'Content-Type': 'text/csv',
//       'Content-Disposition': `attachment; filename=products.csv`,
//     },
//   })
// }

export async function loader({ request, params }: ActionArgs) {
  const products = await prisma.menuItem.findMany({})

  // Your logic to convert products to CSV
  const csv = convertToCSV(products)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=products.csv`,
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
