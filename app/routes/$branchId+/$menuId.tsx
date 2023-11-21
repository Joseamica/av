import { useLoaderData } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function PaymentMenuId() {
  const data = useLoaderData()
  return <div>Name</div>
}
