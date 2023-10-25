import { conform } from '@conform-to/react'

import { CheckboxField, ErrorList, Field } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function CategoryForm({
  intent,
  fields,
  categories,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  categories: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  return (
    <>
      <Field
        labelProps={{ children: 'Display Order' }}
        inputProps={{
          ...conform.input(fields.displayOrder, { type: 'number' }),
          required: true,
          defaultValue: isEditing ? categories.find(category => category.id === editSubItemId)?.displayOrder : '',
        }}
        errors={[fields?.displayOrder.errors]}
      />
      <Field
        labelProps={{ children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: isEditing ? categories.find(category => category.id === editSubItemId)?.name : '',
          type: 'text',
        }}
        errors={fields.name.errors}
      />
      <Field
        labelProps={{ children: 'Image' }}
        inputProps={{
          ...conform.input(fields.image),
          defaultValue: isEditing ? categories.find(category => category.id === editSubItemId)?.image : '',
          type: 'url',
        }}
        errors={fields.image.errors}
      />
      <CheckboxField
        labelProps={{ children: 'Category is a PDF?' }}
        buttonProps={{
          ...conform.input(fields.pdf, { type: 'checkbox' }),
          defaultChecked: isEditing ? categories.find(category => category.id === editSubItemId)?.pdf : '',
        }}
        errors={fields.pdf.errors}
      />
      <H5>Select the menus</H5>
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex space-x-2 items-center">
              <input
                type="checkbox"
                {...conform.input(fields.selectItems, { type: 'checkbox' })}
                name="selectItems"
                value={keys.id}
                defaultChecked={isEditing ? categories.find(category => category.id).menu.find(menu => menu.id === keys.id) : ''}
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting ? (isEditing ? 'Editing category...' : 'Adding category...') : isEditing ? 'Edit category' : 'Add category'}
      </Button>
    </>
  )
}
