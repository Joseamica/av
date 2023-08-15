import { conform, useForm } from '@conform-to/react'
import { Form, Link, useActionData, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect, useRef } from 'react'

import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { createUserSession } from '~/session.server'

import { createUser, getUserByEmail } from '~/models/user.server'

import { safeRedirect, validateEmail } from '~/utils'

import { Field } from '~/components/admin/ui/forms'

const categoriesFormSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
})

export const loader = async ({ request }: LoaderArgs) => {
  // const userId = await getUserId(request);
  // if (userId) return redirect("/");
  return json({})
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  if (!validateEmail(email)) {
    return json({ errors: { email: 'Email is invalid', password: null } }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length === 0) {
    return json({ errors: { email: null, password: 'Password is required' } }, { status: 400 })
  }

  if (password.length < 8) {
    return json({ errors: { email: null, password: 'Password is too short' } }, { status: 400 })
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return json(
      {
        errors: {
          email: 'A user already exists with this email',
          password: null,
        },
      },
      { status: 400 },
    )
  }

  const user = await createUser(email, password)

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  })
}

export const meta: V2_MetaFunction = () => [{ title: 'Sign Up' }]

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined
  const actionData = useActionData<typeof action>()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const data = useLoaderData()

  const [form, fields] = useForm({
    id: 'categories',
    constraint: getFieldsetConstraint(categoriesFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: categoriesFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          {/* <Field
            labelProps={{ htmlFor: fields.username.id, children: 'Username' }}
            inputProps={{
              ...conform.input(fields.username, { type: 'text' }),
              placeholder: 'Joe',
            }}
            errors={[fields?.username.errors]}
          />*/}
          <Field
            labelProps={{ htmlFor: fields.username.id, children: 'Username' }}
            inputProps={{
              ...conform.input(fields.username, { type: 'text' }),
              placeholder: 'Joe',
              required: true,
              autoComplete: 'username',
            }}
            errors={[fields?.username.errors]}
          />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400">
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: '/login',
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
