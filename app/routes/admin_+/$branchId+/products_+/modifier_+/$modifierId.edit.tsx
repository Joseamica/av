import { conform, useForm } from '@conform-to/react'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, H4, H5, Spacer } from '~/components'
import { ErrorList, Field } from '~/components/forms'
import { SubModal } from '~/components/modal'

const modifierSchema = z.object({
  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  name: z.string().min(2),
  extraPrice: z.number().min(0).optional(),
})

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { branchId, modifierId } = params
  const modifier = await prisma.modifiers.findFirst({
    where: {
      id: modifierId,
    },
    include: {
      modifierGroups: true,
    },
  })
  const modifierGroups = await prisma.modifierGroup.findMany({
    where: {
      branchId,
    },
  })
  return json({ modifier, modifierGroups })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parse(formData, {
    schema: modifierSchema,
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

  await prisma.modifiers.update({
    where: { id: params.modifierId },
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
    },
  })
  return redirect('..')
}

export default function EditModifier() {
  const data = useLoaderData()

  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [form, fields] = useForm({
    id: 'products',
    constraint: getFieldsetConstraint(modifierSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: modifierSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  return (
    <SubModal onClose={() => navigate(-1)} title={data.modifier.name}>
      <fetcher.Form method="POST" {...form.props}>
        <Field
          labelProps={{ children: 'Name' }}
          inputProps={{
            ...conform.input(fields.name, { type: 'text' }),
            required: true,
            placeholder: 'Tipo de salsa',
            defaultValue: data.modifier.name ? data.modifier.name : '',
          }}
          errors={[fields?.name.errors]}
        />
        <Field
          labelProps={{ children: 'Code' }}
          inputProps={{
            ...conform.input(fields.plu, { type: 'text' }),
            required: true,
            readOnly: true,
            //   name: 'plu',
            //   value: autoCode,
            defaultValue: data.modifier.plu ? data.modifier.plu : '',
          }}
          errors={[fields?.plu.errors]}
        />
        <Field
          labelProps={{ children: 'Extra Price' }}
          inputProps={{
            ...conform.input(fields.extraPrice, { type: 'number' }),
            required: true,

            //   name: 'extraPrice',
            //   value: autoCode,

            defaultValue: data.modifier.extraPrice ? data.modifier.extraPrice : '',
          }}
          errors={[fields?.extraPrice.errors]}
        />

        <Spacer size="md" />
        <H4 variant="secondary" className="underline">
          Add this modifier to a modifier group.
        </H4>
        <div>
          {/* {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...conform.input(fields.modifierGroups, { type: 'radio' })}
                name="modifierGroups"
                value={keys.id}
                defaultChecked={isEditing ? modifiers.modifierGroupId === keys.id : false}
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })} */}
        </div>

        <Spacer size="md" />

        <Button size="medium" type="submit" variant="secondary">
          {isSubmitting ? 'Editing modifier' : 'Edit modifier'}
        </Button>
      </fetcher.Form>
    </SubModal>
  )
}
