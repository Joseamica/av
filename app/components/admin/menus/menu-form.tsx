import { conform } from '@conform-to/react'

import { ErrorList, Field } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function MenuForm({
  intent,
  fields,
  menus,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  menus: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  return (
    <>
      <Field
        labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name, { type: 'text' }),
          defaultValue: isEditing ? menus.find(menu => menu.id === editSubItemId)?.name : '',
        }}
        errors={[fields?.name.errors]}
      />
      <Field
        labelProps={{ htmlFor: fields.type.id, children: 'Type' }}
        inputProps={{
          ...conform.input(fields.type, { type: 'text' }),
          // autoComplete: data.menu?.type,
          defaultValue: isEditing ? menus.find(menu => menu.id === editSubItemId)?.type : '',
        }}
        errors={[fields?.type.errors]}
      />
      <Field
        labelProps={{ htmlFor: fields.currency.id, children: 'Currency' }}
        inputProps={{
          ...conform.input(fields.currency, { type: 'text' }),

          defaultValue: isEditing ? menus.find(menu => menu.id === editSubItemId)?.currency : '',
        }}
        errors={[fields?.currency.errors]}
      />
      <Field
        labelProps={{ htmlFor: fields.image.id, children: 'Image' }}
        inputProps={{
          ...conform.input(fields.image, { type: 'url' }),
          defaultValue: isEditing ? menus.find(menu => menu.id === editSubItemId)?.image : '',
        }}
        errors={[fields?.image.errors]}
      />
      <H5>Availabilities</H5>
      <div>
        {addingData?.data.map(key => {
          return (
            <label key={key.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...conform.input(fields.selectItems, { type: 'checkbox' })}
                name="selectItems"
                id={key.id}
                value={key.id}
                defaultChecked={key.menuId === editSubItemId ? true : false}
              />
              <H5>
                {key.dayOfWeek} - {key.startTime} - {key.endTime}
              </H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting ? (isEditing ? 'Editing menu...' : 'Adding menu...') : isEditing ? 'Edit menu' : 'Add menu'}
      </Button>
    </>
  )
}
