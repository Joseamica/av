import { conform, useForm } from '@conform-to/react'
import * as Separator from '@radix-ui/react-separator'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, FlexRow, H2, H5, Modal, Spacer } from '~/components'

export const notificationSchema = z.object({
  //   status: z.enum(['pending', 'accepted', 'rejected', 'completed']),
})

export async function loader({ request, params }: LoaderArgs) {
  const { notId } = params
  const notification = await prisma.notification.findUnique({
    where: {
      id: notId,
    },
    include: {
      employees: true,
      user: {
        select: {
          name: true,
        },
      },
      table: true,
      branch: true,
    },
  })
  //   await prisma.notification.update({
  //     where: {
  //       id: notId,
  //     },
  //     data: {
  //       status: 'received',
  //     },
  //   })
  return json({ notification })
}
export async function action({ request, params }: ActionArgs) {
  const { notId } = params

  const formData = await request.formData()
  //   const submission = parse(formData, {
  //     schema: notificationSchema,
  //   })
  //   console.log('submission', submission)
  //   if (submission.intent !== 'submit') {
  //     return json({ status: 'idle', submission } as const)
  //   }
  //   if (!submission.value) {
  //     return json(
  //       {
  //         status: 'error',
  //         submission,
  //       } as const,
  //       { status: 400 },
  //     )
  //   }

  await prisma.notification.update({
    where: {
      id: notId,
    },
    data: {
      status: 'accepted',
    },
  })
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  //   const [form, fields] = useForm({
  //     id: 'inline-login',
  //     constraint: getFieldsetConstraint(notificationSchema),
  //     lastSubmission: fetcher.data?.submission ?? data?.submission,
  //     onValidate({ formData }) {
  //       return parse(formData, { schema: notificationSchema })
  //     },
  //     shouldRevalidate: 'onBlur',
  //   })

  const navigate = useNavigate()
  return (
    <Modal onClose={() => navigate('..')} title="Notification">
      <fetcher.Form method="POST" className="p-4">
        <div className="flex flex-col space-y-2">
          <H2>Mensaje: {data.notification.message}</H2>
          <H2>Usuario: {data.notification.user.name}</H2>
          <H2>Mesa: {data.notification.table.number}</H2>
        </div>
        <Separator.Root className="bg-zinc-400 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />
        {/* <FlexRow>
          <H2>Status: {data.notification.status}</H2>
          <select
            {...conform.input(fields.status)}
            className="flex h-10 px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Rejected</option>
          </select>
        </FlexRow> */}

        <Spacer size="sm" />
        <Button type="submit" variant="payment" fullWith={true}>
          {isSubmitting ? 'Loading...' : 'Atender'}
        </Button>
      </fetcher.Form>
    </Modal>
  )
}
