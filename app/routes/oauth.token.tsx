import {json} from '@remix-run/node'

export async function loader({request, params}: LoaderArgs) {
  const rawData = await request.text()
  console.log('rawData', rawData)
  // Parse the raw data to JSON
  //   const data = JSON.parse(rawData)
  //   console.log(data)

  return json({success: true})
}

export async function action({request, params}: ActionArgs) {
  const rawData = await request.text()
  console.log('rawData', rawData)
  return json({a: 'a'})
}
