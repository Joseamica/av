import { useLoaderData } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function PaymentMenuId() {
  const data = useLoaderData()
  return <div>Name</div>
}
