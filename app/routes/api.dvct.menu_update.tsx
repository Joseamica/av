import type {ActionArgs} from '@remix-run/node'

export const action = async ({request}: ActionArgs) => {
  const rawData = await request.text()
  const [menu] = JSON.parse(rawData)
  console.log('menu', menu)
}
