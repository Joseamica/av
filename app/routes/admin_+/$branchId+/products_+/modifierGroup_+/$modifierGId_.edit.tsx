import { conform, useForm } from '@conform-to/react'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import React from 'react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { checkboxSchema } from '~/utils/zod-extensions'

import { Button, FlexRow, H4, H5, H6, Spacer } from '~/components'
import { CheckboxField, ErrorList, Field } from '~/components/forms'
import { SubModal } from '~/components/modal'

const modifierGroupSchema = z.object({
  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  name: z.string().min(2),
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  multiMax: checkboxSchema().optional(),
  // multiply: z.number().min(0).optional(),

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
  const { branchId, modifierGId } = params
  const modifierGroup = await prisma.modifierGroup.findFirst({
    where: {
      id: modifierGId,
    },
    include: {
      products: true,
      modifiers: true,
    },
  })
  const products = await prisma.product.findMany({
    where: {
      branchId,
    },
  })
  return json({ modifierGroup, products })
}
export async function action({ request, params }: ActionFunctionArgs) {
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
  await prisma.modifierGroup.update({
    where: { id: params.modifierGId },
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
    },
  })

  return redirect(`/admin/${params.branchId}/products/modifierGroup/${params.modifierGId}`)
}

export default function EditModifierGroup() {
  const data = useLoaderData()

  const [autoCode, setAutoCode] = React.useState('')
  const [required, setRequired] = React.useState(data.modifierGroup.min > 0)
  const [maxSelection, setMaxSelection] = React.useState(data.modifierGroup.max > 0)

  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  const [form, fields] = useForm({
    id: 'modifierGroup',
    constraint: getFieldsetConstraint(modifierGroupSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: modifierGroupSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  return (
    <SubModal onClose={() => navigate(-1)} title={data.modifierGroup.name}>
      <fetcher.Form method="POST" {...form.props}>
        <Field
          labelProps={{ children: 'Name' }}
          inputProps={{
            ...conform.input(fields.name, { type: 'text' }),
            required: true,
            placeholder: 'Tipo de salsa',
            defaultValue: data.modifierGroup?.name,
            //   onChange: handleNameChange, // Add this line
          }}
          errors={[fields?.name.errors]}
        />
        <Field
          labelProps={{ children: 'Code' }}
          inputProps={{
            ...conform.input(fields.plu, { type: 'text' }),
            required: true,
            defaultValue: data.modifierGroup.plu ? data.modifierGroup.plu : '',
          }}
          errors={[fields?.plu.errors]}
        />
        <H5>Select Options</H5>
        <div className="flex flex-col p-2 border rounded-sm">
          <FlexRow>
            <input
              type="checkbox"
              {...conform.input(fields.required, { type: 'checkbox' })}
              onChange={() => setRequired(!required)}
              defaultChecked={required ? required : false}
            />
            <H6 variant="secondary">Required Selection</H6>
          </FlexRow>
          <Spacer spaceY="1" />

          {required && (
            <Field
              labelProps={{}}
              inputProps={{
                ...conform.input(fields.min, { type: 'number' }),
                required: true,
                defaultValue: data.modifierGroup.min ? data.modifierGroup.min : 1,
              }}
              errors={[fields?.min.errors]}
            />
          )}
          <FlexRow>
            <input
              type="checkbox"
              {...conform.input(fields.required, { type: 'checkbox' })}
              defaultChecked={maxSelection ? maxSelection : false}
              onChange={() => setMaxSelection(!maxSelection)}
            />
            <H6 variant="secondary">Maximum selection</H6>
            <Spacer size="sm" />
          </FlexRow>
          <Spacer spaceY="1" />

          {maxSelection && (
            <Field
              labelProps={{}}
              inputProps={{
                ...conform.input(fields.max, { type: 'number' }),
                required: true,
                defaultValue: data.modifierGroup.max ? data.modifierGroup.max : 1,
              }}
              errors={[fields?.max.errors]}
            />
          )}
        </div>
        <Spacer size="sm" />
        <CheckboxField
          labelProps={{
            children: 'Allow customers to select an item more than once',
          }}
          buttonProps={{
            ...conform.input(fields.multiMax, { type: 'number' }),
            required: true,
            defaultChecked: data.modifierGroup.multiMax ? data.modifierGroup.multiMax : false,
          }}
          // errors={[fields?.multiMax.errors]}
        />

        {/*<Spacer size="md" />
        <H4 variant="secondary" className="underline">
          Add this modifierGroup to a product
        </H4>
      <div>
          {addingData?.data.map(keys => {
            return (
              <label key={keys.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...conform.input(fields.selectItems, { type: 'checkbox' })}
                  name="selectItems"
                  value={keys.id}
                  defaultChecked={isEditing ? modifierGroups.products.find(product => product.id === keys.id) : false}
                />
                <H5>{keys[addingData.keys]}</H5>
              </label>
            )
          })}
          {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
        </div> */}
        {/* <Spacer size="md" />
        <H4 variant="secondary" className="underline">
          Add modifiers
        </H4>
         <div>
          {addingData?.modifiers.map(keys => {
            return (
              <label key={keys.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...conform.input(fields.modifiers, { type: 'checkbox' })}
                  name="modifiers"
                  value={keys.id}
                  defaultChecked={isEditing ? modifierGroups.modifiers.find(modifier => modifier.id === keys.id) : false}
                />
                <H5>{keys.name}</H5>
              </label>
            )
          })}
          {fields.modifiers.errors && <ErrorList errors={fields.modifiers.errors} />}
        </div> */}
        <Spacer size="md" />

        <Button size="medium" type="submit" variant="secondary">
          {isSubmitting ? 'Editing modifier Group' : 'Add modifier Group'}
        </Button>
      </fetcher.Form>
    </SubModal>
  )
}
