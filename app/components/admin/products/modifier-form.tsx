import { conform } from '@conform-to/react'
import React from 'react'

import { ErrorList, Field } from '../ui/forms'

import { generateRandomChars } from '~/utils'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H4, H5 } from '~/components/util/typography'

export function ModifierForm({
  intent,
  fields,
  modifiers,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  modifiers: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  const [autoCode, setAutoCode] = React.useState('')

  const handleNameChange = event => {
    const name = event.target.value
    if (name && name.length >= 2) {
      const prefix = name.substring(0, 2).toUpperCase()
      const randomChars = generateRandomChars(4) // New function to generate 4 random alphanumeric characters
      const secondRandomChars = generateRandomChars(4) // New function to generate 4 random alphanumeric characters

      setAutoCode(`PLU-MD-${prefix}-${randomChars}-${secondRandomChars}`)
    } else {
      setAutoCode('')
    }
  }

  return (
    <>
      <Field
        labelProps={{ children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name, { type: 'text' }),
          required: true,
          placeholder: 'Tipo de salsa',
          defaultValue: isEditing ? modifiers.name : '',
          onChange: handleNameChange, // Add this line
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
          defaultValue: isEditing ? modifiers.plu : autoCode,
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

          defaultValue: isEditing ? modifiers.extraPrice : '',
        }}
        errors={[fields?.extraPrice.errors]}
      />

      <Spacer size="md" />
      <H4 variant="secondary" className="underline">
        Add this modifier to a modifier group.
      </H4>
      <div>
        {addingData?.data.map(keys => {
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
        })}
        {fields.modifierGroups.errors && <ErrorList errors={fields.modifierGroups.errors} />}
      </div>

      <Spacer size="md" />

      <Button size="medium" type="submit" variant="secondary" name={conform.INTENT} value={isEditing ? 'editModifier' : 'submit'}>
        {isSubmitting ? (isEditing ? 'Editing modifier...' : 'Adding modifier...') : isEditing ? 'Edit modifier' : 'Add modifier'}
      </Button>
    </>
  )
}
