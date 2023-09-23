import { conform, useForm } from '@conform-to/react'
import { Form, Link, useActionData, useLoaderData, useSearchParams } from '@remix-run/react'
import { useId, useState } from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'

import { EVENTS } from '~/events'

import { getRandomColor, getTableIdFromUrl, safeRedirect } from '~/utils'
import { nameSchema } from '~/utils/user-validation'

import { Button, ContentForm, FlexRow, H4, Spacer } from '~/components'
import { ErrorList } from '~/components/admin/ui/forms'
import { Label } from '~/components/admin/ui/label'
// * CUSTOM COMPONENTS
import { Modal } from '~/components/modals'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 //30 days

export const loginFormSchema = z.object({
  name: nameSchema,
  color: z.string().optional(),
  redirectTo: z.string().optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}

export const action = async ({ request, params }: ActionArgs) => {
  const session = await getSession(request)
  const formData = await request.formData()

  const submission = parse(formData, { schema: loginFormSchema })
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

  // console.log('submission', submission)
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')
  // const isOrderActive = await prisma.order.findFirst({
  //   where: { active: true, tableId: tableId },
  // })
  const createdUser = await prisma.user.create({
    data: {
      name: submission.value.name,
      color: submission.value.color ? submission.value.color : '#000000',
      // orderId: isOrderActive ? isOrderActive.id : null,
      //   sessions: {
      //     create: {
      //       expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
      //     },
      //   },
    },
    include: { sessions: true },
  })

  session.set('username', submission.value.name)
  session.set('user_color', submission.value.color)
  session.set('userId', createdUser.id)
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}
export default function SetDetails() {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const actionData = useActionData()

  const [form, fields] = useForm({
    id: 'inline-login',
    defaultValue: { redirectTo },
    constraint: getFieldsetConstraint(loginFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: loginFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const handleError = fields?.name.errors !== undefined

  const randomColor = getRandomColor()

  const errorClass = handleError ? 'animate-pulse placeholder:text-warning' : ''

  return (
    <div className="hide-scrollbar no-scrollbar relative mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
      <div id="modal-root" />
      <Modal handleClose={() => null} title="Registro de usuario" isOpen={true}>
        <Form method="POST" className=" bg-day-bg_principal" {...form.props}>
          <div
            className={`flex w-full flex-row items-center bg-button-notSelected px-4 py-2 ${handleError && errorClass} ${
              handleError && 'border-2 border-warning'
            }`}
          >
            <input
              {...conform.input(fields.name)}
              type="text"
              autoCapitalize="words"
              autoFocus={true}
              className={`flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 ${
                handleError && errorClass
              } `}
              placeholder="Nombre"
            />
          </div>

          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields?.name.errors ? <ErrorList size="lg" errors={fields?.name.errors} /> : null}
          </div>

          <input {...conform.input(fields.redirectTo)} type="hidden" />

          <div className="flex flex-col items-start justify-start p-4">
            <FlexRow>
              <Label htmlFor="color" className="pl-4 text-3xl">
                Escoge tu color:
              </Label>
              <div className="transparent h-10 w-10 overflow-hidden">
                <input {...conform.input(fields.color)} type="color" defaultValue={randomColor} className="h-full w-full" />
              </div>
            </FlexRow>
            <Spacer spaceY="4" />

            <Button fullWith={true} type="submit">
              Continuar a la mesa
            </Button>
            <Spacer spaceY="2" />

            <Link to="/join" className="self-center  underline underline-offset-4">
              O puedes iniciar sesión aquí
            </Link>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
