import { useLoaderData } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { H2 } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  return (
    <div>
      <H2>Total propinas</H2>
      <H2>Mesas atendidas</H2>
      <H2>3</H2>
    </div>
  )
}
