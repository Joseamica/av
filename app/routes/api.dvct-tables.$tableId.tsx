import {json} from '@remix-run/node'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  console.log('tableId', tableId)

  return json({success: true})
}
