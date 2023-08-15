import { conform, useForm } from '@conform-to/react'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'

import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { createUserSession, getSession, getUserId } from '~/session.server'

import { safeRedirect } from '~/utils'
import { emailSchema, passwordSchema } from '~/utils/user-validation'
import { checkboxSchema } from '~/utils/zod-extensions'

import { Spacer } from '~/components'
import { CheckboxField, ErrorList, Field } from '~/components/admin/ui/forms'
import { StatusButton } from '~/components/ui/buttons/status-button'

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  redirectTo: z.string().optional(),
  remember: checkboxSchema(),
})

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  const userId = await getUserId(session)
  if (userId) return json({})
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  const submission = await parse(formData, {
    schema: () => {
      return loginFormSchema.superRefine(async (data, ctx) => {
        console.log('data', data)
        const userWithPassword = await prisma.user.findUnique({
          where: { email: data.email },
          include: {
            password: true,
          },
        })
        if (!userWithPassword || !userWithPassword.password) {
          ctx.addIssue({
            path: ['email'],
            code: z.ZodIssueCode.custom,
            message: 'Invalid email',
          })
          return
        }
        const isValid = await bcrypt.compare(data.password, userWithPassword.password.hash)
        if (!isValid) {
          ctx.addIssue({
            path: ['password'],
            code: z.ZodIssueCode.custom,
            message: 'Password incorrect',
          })
          return
        }
      })
    },
    async: true,
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }
  const userWithPassword = await prisma.user.findUnique({
    where: { email: submission.value.email },
    include: {
      password: true,
    },
  })

  return createUserSession({
    redirectTo,
    remember: submission.value.remember,
    request,
    userId: userWithPassword.id,
  })
}

export const meta: V2_MetaFunction = () => [{ title: 'Login' }]

export default function LoginPage() {
  const data = useLoaderData()
  const loginFetcher = useFetcher<typeof action>()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [form, fields] = useForm({
    id: 'inline-login',
    defaultValue: { redirectTo },
    constraint: getFieldsetConstraint(loginFormSchema),
    lastSubmission: loginFetcher.data?.submission ?? data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: loginFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <div className="flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome back!</h1>
          <p className="text-body-md text-muted-foreground">Please enter your details.</p>
        </div>
        <Spacer size="xs" />
        <div>
          <div className="mx-auto w-full max-w-md px-8">
            <loginFetcher.Form method="POST" name="login" {...form.props}>
              <Field
                labelProps={{ children: 'Email' }}
                inputProps={{
                  ...conform.input(fields.email, { type: 'email' }),
                  autoFocus: true,
                  required: true,
                }}
                errors={fields?.email.errors}
              />

              <Field
                labelProps={{ children: 'Password' }}
                inputProps={conform.input(fields?.password, { type: 'password' })}
                errors={fields?.password.errors}
              />

              <div className="flex justify-between">
                <CheckboxField
                  labelProps={{
                    htmlFor: fields?.remember.id,
                    children: 'Remember me',
                  }}
                  buttonProps={conform.input(fields?.remember, { type: 'checkbox' })}
                  errors={fields?.remember.errors}
                />

                <div>
                  <Link to="/forgot-password" className="text-body-xs font-semibold">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <input {...conform.input(fields?.redirectTo)} type="hidden" />
              <ErrorList errors={[...form.errors]} id={form.errorId} />

              <div className="flex items-center justify-between gap-6 pt-3">
                <StatusButton
                  className="w-full"
                  status={loginFetcher.state === 'submitting' ? 'pending' : loginFetcher.data?.status}
                  type="submit"
                  disabled={loginFetcher.state !== 'idle'}
                >
                  Log in
                </StatusButton>
              </div>
            </loginFetcher.Form>
            <div className="flex items-center justify-center gap-2 pt-6">
              <span className="text-muted-foreground">New here?</span>
              <Link to="/join">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
