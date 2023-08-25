import { conform } from '@conform-to/react'

import { ErrorList, Field } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function AvailabilityForm({
  intent,
  fields,
  availabilities,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  availabilities: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  return (
    <>
      <Field
        labelProps={{ children: 'Day of the Week' }}
        inputProps={{
          ...conform.input(fields.dayOfWeek),
          defaultValue: isEditing ? availabilities.find(availability => availability.id === editSubItemId)?.dayOfWeek : '',
          type: 'number',
          min: 1,
          max: 7,
          step: 1,
        }}
        errors={fields.dayOfWeek.errors}
      />
      <Field
        labelProps={{ children: 'Start Time' }}
        inputProps={{
          ...conform.input(fields.startTime),
          defaultValue: isEditing ? availabilities.find(availability => availability.id === editSubItemId)?.startTime : '',
          type: 'time',
        }}
        errors={fields.startTime.errors}
      />
      <Field
        labelProps={{ children: 'End Time' }}
        inputProps={{
          ...conform.input(fields.endTime),
          defaultValue: isEditing ? availabilities.find(availability => availability.id === editSubItemId)?.endTime : '',
          type: 'time',
        }}
        errors={fields.endTime.errors}
      />
      {/* TODO add ability to add to multiple keyss */}
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex items-center space-x-2">
              <input
                {...conform.input(fields.selectItems, { type: 'radio' })}
                name="selectItems"
                value={keys.id}
                defaultChecked={
                  isEditing ? availabilities.find(availability => availability.id === editSubItemId)?.menuId === keys.id : false
                }
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting
          ? isEditing
            ? 'Editing availability...'
            : 'Adding availability...'
          : isEditing
          ? 'Edit availability'
          : 'Add availability'}
      </Button>
    </>
  )
}
