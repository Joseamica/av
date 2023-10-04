import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import { useFetcher, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { EVENTS } from '~/events'

import { Button, FlexRow, H2, H3, H5, XIcon } from '~/components'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'

const noficationsSchema = z.object({
  id: z.string(),
  tip: z.number(),
  amount: z.number(),
  total: z.number(),
  userId: z.string(),
  orderId: z.string(),
  //   intent: z.enum(['accept', 'reject']),
})

export async function loader({ request, params }: LoaderArgs) {
  const { branchId, notificationId } = params
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    include: {
      table: true,
      user: true,
      employees: true,
    },
  })

  return json({ notification })
}
export async function action({ request, params }: ActionArgs) {
  const { branchId, notificationId } = params

  const formData = await request.formData()
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    include: {
      table: true,
      user: true,
      employees: true,
    },
  })
  const submission = parse(formData, {
    schema: noficationsSchema,
  })
  console.log('submission', submission)
  //   if (submission.intent !== 'submit' ) {
  //     return json({ status: 'idle', submission } as const)
  //   }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }

  if (submission.intent === 'accept') {
    await prisma.payments.create({
      data: {
        method: 'cash',
        amount: submission.value.amount,
        tip: submission.value.tip,
        total: submission.value.total,
        branchId: params.branchId,
        orderId: submission.value.orderId,
        userId: submission.value.userId,
      },
    })
    await prisma.notification.update({
      where: { id: submission.value.id },
      data: {
        status: 'accepted',
      },
    })
  } else {
    await prisma.notification.update({
      where: { id: submission.value.id },
      data: {
        status: 'rejected',
      },
    })
  }
  EVENTS.ISSUE_CHANGED(notification.table.id)

  return redirect(`/admin/${params.branchId}/notifications`)
}

export default function Name() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  const navigate = useNavigate()
  const params = useParams()

  const [form, fields] = useForm({
    id: 'notifications',
    constraint: getFieldsetConstraint(noficationsSchema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: noficationsSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  console.log('data.notification', data.notification)

  return (
    <Dialog.Root open={true} onOpenChange={() => navigate(`/admin/${params.branchId}/notifications`)}>
      <Dialog.Overlay className="fixed top-0 bottom-0 left-0 right-0 grid overflow-y-auto bg-black place-items-center bg-opacity-80">
        <Dialog.Close className="absolute top-0 right-0 p-3 m-3 bg-white rounded-full">
          <XIcon />
        </Dialog.Close>
        <Dialog.Content className="bg-white p-8 rounded-md min-w-[450px]">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
            {'Mesa ' + data.notification.table?.number + ' ' + 'de: ' + data.notification.user.name}
          </Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            STATUS: {data.notification.status}
          </Dialog.Description>
          <div className="my-2 border">
            {data.notification.employees.length > 0 && (
              <FlexRow>
                <H3>Calling to:</H3>
                <H5 boldVariant="bold">
                  <div className="flex flex-col space-x-2">
                    {data.notification.employees.map(employee => (
                      <span key={employee.id}>{employee.name}</span>
                    ))}
                  </div>
                </H5>
              </FlexRow>
            )}
            {data.notification.type === 'call' ? (
              <>
                <FlexRow>
                  <H3>Table:</H3>
                  <H5 boldVariant="bold">{data.notification.table?.number}</H5>
                </FlexRow>
                <FlexRow>
                  <H3>User:</H3>
                  <H5 boldVariant="bold">{data.notification.user?.name}</H5>
                </FlexRow>
              </>
            ) : (
              <>
                <FlexRow>
                  <H3>Table:</H3>
                  <H5 boldVariant="bold">{data.notification.table?.number}</H5>
                </FlexRow>
                <FlexRow>
                  <H3>User:</H3>
                  <H5 boldVariant="bold">{data.notification.user?.name}</H5>
                </FlexRow>
                <FlexRow>
                  <H3>Amount:</H3>
                  <H5 boldVariant="bold">{data.notification?.amount}</H5>
                </FlexRow>
                <FlexRow>
                  <H3>Tip</H3>
                  <H5 boldVariant="bold">{data.notification?.tip}</H5>
                </FlexRow>
                <FlexRow>
                  <H3>Total to pay:</H3>
                  <H5 boldVariant="bold">{data.notification?.total}</H5>
                </FlexRow>
              </>
            )}
          </div>
          <fetcher.Form method="POST" {...form.props} action="?/updateNotification" className="flex flex-row space-x-2">
            <Button type="submit" disabled={isSubmitting} size="small" variant="primary" name={conform.INTENT} value="accept">
              Accept
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || data.notification.status === 'rejected'}
              size="small"
              variant="danger"
              name={conform.INTENT}
              value="reject"
            >
              Reject
            </Button>
            <input type="hidden" value={data.notification.id ? data.notification.id : ''} {...conform.input(fields.id)} />
            <input type="hidden" value={data.notification.amount} {...conform.input(fields.amount)} />
            <input type="hidden" value={data.notification.tip} {...conform.input(fields.tip)} />
            <input type="hidden" value={data.notification.total} {...conform.input(fields.total)} />
            <input type="hidden" value={data.notification.orderId} {...conform.input(fields.orderId)} />
            <input type="hidden" value={data.notification.user.id} {...conform.input(fields.userId)} />
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Root>
    // <QueryDialog title={data.notification.type.toUpperCase()} description="Accept or reject the request" query={'notificationId'}>
    //   <div className="my-2 border">
    //     <FlexRow>
    //       <H3>Table:</H3>
    //       <H5 boldVariant="bold">{data.notification.table.number}</H5>
    //     </FlexRow>
    //     <FlexRow>
    //       <H3>User:</H3>
    //       <H5 boldVariant="bold">{data.notification.user.name}</H5>
    //     </FlexRow>
    //     <FlexRow>
    //       <H3>Total to pay:</H3>
    //       <H5 boldVariant="bold">{data.notification.message}</H5>
    //     </FlexRow>
    //   </div>
    //   <fetcher.Form method="POST" {...form.props} action="?/updateNotification" className="flex flex-row space-x-2">
    //     <Button type="submit" disabled={isSubmitting} size="small" variant="primary">
    //       Accept
    //     </Button>
    //     <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
    //       Reject
    //     </Button>
    //     <input type="hidden" value={notificationId ? notificationId : ''} {...conform.input(fields.id)} />
    //   </fetcher.Form>
    // </QueryDialog>
  )
}

function safelyParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('Failed to parse JSON:', e)
    return null
  }
}
