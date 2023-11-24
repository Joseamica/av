import { Link, useLoaderData } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Policy() {
  const data = useLoaderData()
  return (
    <div>
      {' '}
      <div className="max-w-screen-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Business Policy for Your Web Application</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            This Business Policy ("Policy") outlines the operational rules and guidelines for the usage of [Your Web Application's Name]
            ("the Application").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
          <ol>
            <li>User: Anyone who uses the Application.</li>
            <li>Restaurant: The business utilizing the Application for its service.</li>
            <li>Waiter: Restaurant staff responsible for serving customers.</li>
            <li>Manager: Personnel in charge of overseeing restaurant operations.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">3. Objectives</h2>
          <p>Objectives of the application.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">4. Features</h2>

          <p>
            o offer a seamless dining experience by providing features like QR scanning for table access, online ordering and payment, and
            real-time order and staff tracking.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">5. User Roles and Responsibilities</h2>
          Restaurant Ensure the Application is fully operational Maintain up-to-date menu and pricing information Monitor orders and fulfill
          them promptly Waiter Assist customers in any Application-related inquiries Ensure prompt order delivery Manager Monitor
          Application for any issues and resolve them Oversee staff and customer activities related to the Application
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">6. Payment and Billing</h2>
          <p>
            All payments made through the Application are final. Billing disputes should be resolved directly with the restaurant's
            management.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">7. Data Privacy and Security</h2>
          <p>All user data will be stored and processed securely, following all applicable laws and regulations.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">8. Customer Support</h2>
          <p>For technical issues, users can summon the waiter or manager through the Application.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
          <p>
            The Application is provided "as is." Any issues arising from its use are the responsibility of the user or the restaurant, as
            applicable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">10. Amendments and Updates</h2>
          <p>We reserve the right to update this Policy periodically. Users are advised to check for the latest version.</p>
        </section>

        <Link to="/" className="text-blue-500">
          Go back to Home
        </Link>
      </div>
    </div>
  )
}
