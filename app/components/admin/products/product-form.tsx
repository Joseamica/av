import { conform } from '@conform-to/react'

import { ErrorList, Field, TextareaField } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H2, H4, H5 } from '~/components/util/typography'

export function ProductForm({
  intent,
  fields,
  products,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  products: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  return (
    <>
      <Field
        labelProps={{ children: 'Code' }}
        inputProps={{
          ...conform.input(fields.plu, { type: 'text' }),
          required: true,
          defaultValue: isEditing ? products.find(product => product.id === editSubItemId)?.plu : 'PLU-',
        }}
        errors={[fields?.plu.errors]}
      />
      <Field
        labelProps={{ children: 'Image' }}
        inputProps={{
          ...conform.input(fields.image, { type: 'url' }),
          required: true,
          placeholder: 'https://',
          defaultValue: isEditing ? products.find(product => product.id === editSubItemId)?.image : '',
        }}
        errors={[fields?.image.errors]}
      />
      <Field
        labelProps={{ children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name, { type: 'text' }),
          required: true,
          placeholder: 'Sopes',
          defaultValue: isEditing ? products.find(product => product.id === editSubItemId)?.name : '',
        }}
        errors={[fields?.name.errors]}
      />
      <TextareaField
        labelProps={{ children: 'Description' }}
        textareaProps={{
          ...conform.textarea(fields.description),
          defaultValue: isEditing ? products.find(product => product.id === editSubItemId)?.description : '',
        }}
        errors={fields?.description.errors}
      />
      <Field
        labelProps={{ children: 'Price' }}
        inputProps={{
          ...conform.input(fields.price, { type: 'number' }),
          required: true,
          placeholder: '$0.00',
          defaultValue: isEditing ? products.find(product => product.id === editSubItemId)?.price : '',
        }}
        errors={[fields?.price.errors]}
      />
      <Spacer size="md" />
      <H4 variant="secondary" className="underline">
        Add this product to a category
      </H4>
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex items-center space-x-2">
              <input
                type="radio"
                {...conform.input(fields.selectItems, { type: 'radio' })}
                name="selectItems"
                value={keys.id}
                defaultChecked={isEditing ? products.find(product => product.id === editSubItemId)?.categoryId === keys.id : false}
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting ? (isEditing ? 'Editing product...' : 'Adding product...') : isEditing ? 'Edit product' : 'Add product'}
      </Button>
    </>
  )
}
