import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import { useFetcher, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils/named-action'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { checkboxSchema } from '~/utils/zod-extensions'

import { XIcon } from '~/components'
import { ModifierForm } from '~/components/admin/products/modifier-form'
import { ModifierGroupForm } from '~/components/admin/products/modifier-group-form'

const modifierSchema = z.object({
  id: z.string().optional(),
  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  name: z.string().min(2),
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  extraPrice: z.number().min(0).optional(),

  selectItems: z.array(z.string()).optional(),
  modifierGroups: z.string().optional(),
})

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

export async function loader({ request, params }: LoaderFunctionArgs) {
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
  const modifierGroup = await prisma.modifierGroup.findUnique({
    where: {
      id: params.id,
    },
    include: {
      products: true,
      modifiers: true,
    },
  })
  const modifiers = await prisma.modifiers.findMany({
    where: {
      branchId: params.branchId,
    },
  })

  const modifier = await prisma.modifiers.findUnique({
    where: {
      id: params.id,
    },
  })

  return json({ products, modifierGroups, modifierGroup, modifiers, modifier })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parse(formData, {
    schema: intent => {
      switch (intent) {
        case 'editModifier':
          return modifierSchema
        case 'editModifierG':
          return modifierGroupSchema
        default:
          throw new Error('invalid intent')
      }
    },
  })

  console.log('submission', submission)

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
    async updateModifierG() {
      await prisma.modifierGroup.update({
        where: {
          id: params.id,
        },
        data: {
          products: {
            set: [],
          },
          modifiers: {
            set: [],
          },
        },
      })
      await prisma.modifierGroup.update({
        where: {
          id: params.id,
        },
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
      return redirect(`/admin/${params.branchId}/products?filter=modifierG`)
    },
    async updateModifier() {
      await prisma.modifiers.update({
        where: {
          id: params.id,
        },
        data: {
          name: submission.value.name,
          plu: submission.value.plu,
          extraPrice: submission.value.extraPrice,

          // multiply: submission.value.multiply,
          branch: {
            connect: {
              id: params.branchId,
            },
          },
          modifierGroups: {
            connect: {
              id: submission.value.modifierGroups,
            },
          },
        },
      })
      return redirect(`/admin/${params.branchId}/products?filter=modifiers`)
    },
  })
}

export default function EditModifierGroup() {
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
  const [searchParams] = useSearchParams()

  const edit = searchParams.get('edit')
  return (
    <>
      <Dialog.Root open={edit === 'modifierG'} onOpenChange={() => navigate(`/admin/${params.branchId}/products?filter=modifierG`)}>
        <Dialog.Overlay className="fixed top-0 bottom-0 left-0 right-0 grid overflow-y-auto bg-black place-items-center bg-opacity-80">
          <Dialog.Close className="absolute top-0 right-0 p-3 m-3 bg-white rounded-full">
            <XIcon />
          </Dialog.Close>
          <Dialog.Content className="bg-white p-8 rounded-md min-w-[450px]">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Edit Modifier Group</Dialog.Title>
            <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              Modify the fields you want to add
            </Dialog.Description>
            <fetcher.Form method="POST" {...form.props} action="?/updateModifierG">
              <ModifierGroupForm
                intent="edit"
                modifierGroups={data.modifierGroup}
                isSubmitting={isSubmitting}
                editSubItemId={edit}
                fields={fields}
                addingData={{ data: data.products, keys: ['name'], modifiers: data.modifiers }}
              />
              <input type="hidden" value={''} {...conform.input(fields.id)} />
            </fetcher.Form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Root>

      <Dialog.Root open={edit === 'modifier'} onOpenChange={() => navigate(`/admin/${params.branchId}/products?filter=modifiers`)}>
        <Dialog.Overlay className="fixed top-0 bottom-0 left-0 right-0 grid overflow-y-auto bg-black place-items-center bg-opacity-80">
          <Dialog.Close className="absolute top-0 right-0 p-3 m-3 bg-white rounded-full">
            <XIcon />
          </Dialog.Close>
          <Dialog.Content className="bg-white p-8 rounded-md min-w-[450px]">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Edit Modifier</Dialog.Title>
            <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              Modify the fields you want to add
            </Dialog.Description>
            <fetcher.Form method="POST" {...form.props} action="?/updateModifier">
              <ModifierForm
                intent="edit"
                modifiers={data.modifier}
                isSubmitting={isSubmitting}
                editSubItemId={edit}
                fields={fields}
                addingData={{ data: data.modifierGroups, keys: ['name'] }}
              />
            </fetcher.Form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Root>
    </>
  )
}
