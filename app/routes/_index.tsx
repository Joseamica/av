import { Link, useLoaderData } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { Button, LinkButton } from '~/components'

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  return (
    <div className="bg-gray-100">
      <header className="bg-blue-600 text-white p-6 flex flex-row justify-between">
        <h1 className="text-4xl">Avoqado</h1>
        <LinkButton to="pos">Eres empleado?</LinkButton>
      </header>

      <main className="container mx-auto p-6">
        <section className="container mx-auto p-6">
          <h2 className="text-2xl mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h3>QR Scanning</h3>
              <p>Scan QR code to access tables.</p>
            </div>
            <div className="p-4 border rounded">
              <h3>Ordering and paying</h3>
              <p>You can now order and pay your order directly</p>
            </div>
          </div>
        </section>
        <section className="container mx-auto p-6">
          <h2 className="text-2xl mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h3>Basic</h3>
              <p>$10/month</p>
            </div>
            <div className="p-4 border rounded">
              <h3>Pro</h3>
              <p>$20/month</p>
            </div>
            <div className="p-4 border rounded">
              <h3>Enterprise</h3>
              <p>Contact us</p>
            </div>
          </div>
        </section>

        <h2 className="text-2xl mb-4">Features</h2>
        <ul className="list-disc list-inside">
          <li>QR Scanning and Table Access</li>
          <li>Ordering and Payment</li>
          <li>Order and User Management</li>
          <li>Order Processing</li>
          <li>Waiter and Manager Summoning</li>
          <li>Waiter or Dish Location Reporting</li>
          <li>Bill Splitting</li>
          <li>Dish Sharing</li>
          <li>Websockets Integration</li>
          <li>RESTful APIs</li>
        </ul>
      </main>
      <footer className="bg-gray-800 text-white p-6 mt-8">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg">Privacy Policy</h3>
            <p className="text-sm">
              Your privacy is important to us. Read our privacy policy <Link to="policy">here.</Link>
            </p>
          </div>
          <div>
            <h3 className="text-lg">Contact</h3>
            <p className="text-sm">Email: hola@avoqado.io</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
