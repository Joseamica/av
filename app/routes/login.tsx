import { conform, useForm } from '@conform-to/react'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { createEmployeeSession, createUserSession, getSession, sessionStorage } from '~/session.server'

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
  isEmployee: checkboxSchema(),
})

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request)
  const tableId = session.get('tableId')
  const employeeId = session.get('employeeId')

  const userId = session.get('userId')
  if (employeeId) return redirect('/dashboard')

  if (!userId) {
    return json({ status: 'idle' })
  }

  const superUser = await prisma.user.findFirst({
    where: {
      id: userId,
      roles: { some: { permissions: { some: { OR: [{ name: 'admin' }, { name: 'moderator' }] } } } },
    },
  })

  if (superUser) {
    return redirect('/admin')
  }

  if (tableId) return redirect(`/table/${tableId}`)

  return json({ status: 'idle' })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  const submission = await parse(formData, {
    schema: () => {
      return loginFormSchema.superRefine(async (data, ctx) => {
        if (!data.isEmployee) {
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
        } else if (data.isEmployee) {
          const employeeWithPassword = await prisma.employee.findUnique({
            where: { email: data.email },
            include: {
              password: true,
            },
          })

          if (!employeeWithPassword || !employeeWithPassword.password) {
            ctx.addIssue({
              path: ['email'],
              code: z.ZodIssueCode.custom,
              message: 'Invalid email',
            })
            return
          }

          const isValid = await bcrypt.compare(data.password, employeeWithPassword.password.hash)

          if (!isValid) {
            ctx.addIssue({
              path: ['password'],
              code: z.ZodIssueCode.custom,
              message: 'Password incorrect',
            })
            return
          }
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

  if (submission.value.isEmployee) {
    const employeeWithPassword = await prisma.employee.findUnique({
      where: { email: submission.value.email },
      include: {
        password: true,
      },
    })

    return createEmployeeSession({
      redirectTo: '/dashboard',
      remember: submission.value.remember,
      request,
      employeeId: employeeWithPassword.id,
    })
  }

  const userWithPassword = await prisma.user.findUnique({
    where: { email: submission.value.email },
    include: {
      password: true,
      roles: true,
    },
  })

  return createUserSession({
    redirectTo: userWithPassword.roles.length > 0 ? '/admin' : redirectTo,
    remember: submission.value.remember,
    request,
    userId: userWithPassword.id,
    username: userWithPassword.name,
  })
}

export const meta: MetaFunction = () => [{ title: 'Login' }]

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
    <div className="flex flex-col justify-center min-h-full pt-20 pb-32">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome back!</h1>
          <p className="text-body-md text-muted-foreground">Please enter your details.</p>
        </div>
        <Spacer size="xs" />
        <div>
          <div className="w-full max-w-md px-8 mx-auto">
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
                  <Link to="/forgot-password" className="font-semibold text-body-xs">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <CheckboxField
                labelProps={{
                  children: 'I am an employee',
                }}
                buttonProps={conform.input(fields?.isEmployee, { type: 'checkbox' })}
                errors={fields?.isEmployee.errors}
              />

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
