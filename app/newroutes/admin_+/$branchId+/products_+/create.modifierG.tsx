import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import { useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { checkboxSchema } from '~/utils/zod-extensions'

import { XIcon } from '~/components'
import { ModifierGroupForm } from '~/components/admin/products/modifier-group-form'

const modifierGroupSchema = z.object({
  id: z.string().optional(),
  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  name: z.string().min(2),
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  multiMax: checkboxSchema().optional(),
  // multiply: z.number().min(0).optional(),
  selectItems: z.array(z.string()).optional(),
  modifiers: z.array(z.string()).optional(),
  // modifiers: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       name: z.string(),
  //       price: z.number(),
  //     }),
  //   )
  //   .optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  const products = await prisma.product.findMany({
    where: {
      branchId: params.branchId,
    },
    orderBy: {
      category: {
        name: 'asc',
      },
    },
    include: {
      category: true,
    },
  })

  const modifierGroups = await prisma.modifierGroup.findMany({
    where: {
      branchId: params.branchId,
    },
  })

  const modifiers = await prisma.modifiers.findMany({
    where: {
      branchId: params.branchId,
    },
  })

  return json({ products, modifierGroups, modifiers })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const submission = parse(formData, {
    schema: modifierGroupSchema,
  })
  console.log('submission', submission)
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

  return namedAction(request, {
    async create() {
      await prisma.modifierGroup.create({
        data: {
          name: submission.value.name,
          plu: submission.value.plu,
          min: submission.value.min ? submission.value.min : 0,
          max: submission.value.max ? submission.value.max : 0,
          multiMax: submission.value.multiMax ? 99 : 0,
          // multiply: submission.value.multiply,
          branch: {
            connect: {
              id: params.branchId,
            },
          },
          products: { connect: submission.value.selectItems ? submission.value.selectItems.map(id => ({ id })) : [] },
          modifiers: { connect: submission.value.modifiers ? submission.value.modifiers.map(id => ({ id })) : [] },
        },
      })
      return redirect(`/admin/${params.branchId}/products`)
    },
  })
}

export default function CreateModifierGroup() {
  const data = useLoaderData()
  const fetcher = useFetcher()

  const [form, fields] = useForm({
    id: 'products',
    constraint: getFieldsetConstraint(modifierGroupSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: modifierGroupSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const isSubmitting = fetcher.state !== 'idle'
  const navigate = useNavigate()
  const params = useParams()

  return (
    <Dialog.Root open={true} onOpenChange={() => navigate(`/admin/${params.branchId}/products`)}>
      <Dialog.Overlay className="fixed top-0 left-0 right-0 bottom-0 grid place-items-center overflow-y-auto bg-black bg-opacity-80">
        <Dialog.Close className="absolute top-0 right-0 m-3 bg-white rounded-full p-3">
          <XIcon />
        </Dialog.Close>
        <Dialog.Content className="bg-white p-8 rounded-md min-w-[450px]">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Add Modifier Group</Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            Modify the fields you want to add
          </Dialog.Description>
          <fetcher.Form method="POST" {...form.props} action="?/create">
            <ModifierGroupForm
              intent="add"
              modifierGroups={data.modifierGroups}
              isSubmitting={isSubmitting}
              fields={fields}
              addingData={{ data: data.products, keys: ['name'], modifiers: data.modifiers }}
            />
            <input type="hidden" value={''} {...conform.input(fields.id)} />
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Root>
  )
}
