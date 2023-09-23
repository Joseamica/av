import { conform, useForm } from '@conform-to/react'
import { Form, Link, useActionData, useFormAction, useNavigation } from '@remix-run/react'

import { type DataFunctionArgs, type LoaderArgs, type V2_MetaFunction, json } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { createUserSession } from '~/session.server'

import { createUser } from '~/models/user.server'

import { getRandomColor, safeRedirect } from '~/utils'
import { emailSchema, passwordSchema, usernameSchema } from '~/utils/user-validation'

import { ErrorList, Field } from '~/components/admin/ui/forms'
import { StatusButton } from '~/components/ui/buttons/status-button'

const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema,
  color: z.string().optional(),
})

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Sign Up | Epic Notes' }]
}

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}
export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData()
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  const submission = await parse(formData, {
    schema: () => {
      return signupSchema.superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
          select: { id: true },
        })
        if (existingUser) {
          ctx.addIssue({
            path: ['email'],
            code: z.ZodIssueCode.custom,
            message: 'A user already exists with this email',
          })
          return
        }
      })
    },
    // acceptMultipleErrors: () => true,
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

  const user = await createUser(submission.value.username, submission.value.email, submission.value.password, submission.value.color)

  return createUserSession({
    redirectTo,
    username: submission.value.username,
    remember: false,
    request,
    userId: user.id,
  })
}

export default function Name() {
  const actionData = useActionData()
  const formAction = useFormAction()
  const navigation = useNavigation()
  const isSubmitting = navigation.formAction === formAction
  const [form, fields] = useForm({
    id: 'signup-form',
    constraint: getFieldsetConstraint(signupSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      const result = parse(formData, { schema: signupSchema })
      return result
    },
    shouldRevalidate: 'onBlur',
  })

  const randomColor = getRandomColor()

  return (
    <div className="container mx-auto flex flex-col justify-center pb-32 pt-20 ">
      <div className="text-center">
        <h1 className="text-h1">Let's start your journey!</h1>
        <p className="mt-3 text-body-md text-muted-foreground">Please enter your email.</p>
      </div>
      <Form method="POST" className="mx-auto mt-16 min-w-[368px]  max-w-md px-8" {...form.props}>
        <Field
          labelProps={{ htmlFor: fields.username.id, children: 'Username' }}
          inputProps={{
            ...conform.input(fields.username),
            autoFocus: true,
          }}
          errors={[fields?.username.errors]}
        />
        <Field
          labelProps={{
            htmlFor: fields.email.id,
            children: 'Email',
          }}
          inputProps={{ ...conform.input(fields.email) }}
          errors={[fields?.email.errors]}
        />
        <Field
          labelProps={{
            htmlFor: fields.password.id,
            children: 'Password',
          }}
          inputProps={{ ...conform.input(fields.password), type: 'password' }}
          errors={[fields?.password.errors]}
        />
        <Field
          labelProps={{
            htmlFor: fields.color.id,
            children: 'Choose your color',
          }}
          inputProps={{
            ...conform.input(fields.color, { type: 'color' }),
            defaultValue: randomColor,
          }}
          errors={[fields?.color.errors]}
        />

        <ErrorList errors={form.errors} id={form.errorId} />
        <StatusButton
          className="w-full"
          status={isSubmitting ? 'pending' : actionData?.status ?? 'idle'}
          type="submit"
          disabled={isSubmitting}
        >
          Submit
        </StatusButton>
        <div className="flex items-center justify-center gap-2 pt-6">
          <span className="text-muted-foreground">Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </Form>
    </div>
  )
}
