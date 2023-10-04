import { conform } from '@conform-to/react'
import React from 'react'

import { KeyInstance } from 'twilio/lib/rest/api/v2010/account/key'

import { CheckboxField, ErrorList, Field, TextareaField } from '../ui/forms'

import { generateRandomChars } from '~/utils'

import { Modal, SubModal } from '~/components/modal'
import { Button } from '~/components/ui/buttons/button'
import { FlexRow } from '~/components/util/flexrow'
import { Spacer } from '~/components/util/spacer'
import { H2, H4, H5, H6 } from '~/components/util/typography'

export function ModifierGroupForm({
  intent,
  fields,
  modifierGroups,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  modifierGroups: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  const [autoCode, setAutoCode] = React.useState('')
  const [required, setRequired] = React.useState(false)
  const [maxSelection, setMaxSelection] = React.useState(true)

  const handleNameChange = event => {
    const name = event.target.value
    if (name && name.length >= 2) {
      const prefix = name.substring(0, 2).toUpperCase()
      const randomChars = generateRandomChars(4) // New function to generate 4 random alphanumeric characters
      const secondRandomChars = generateRandomChars(4) // New function to generate 4 random alphanumeric characters

      setAutoCode(`PLU-MG-${prefix}-${randomChars}-${secondRandomChars}`)
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
          defaultValue: isEditing ? modifierGroups.name : '',
          onChange: handleNameChange, // Add this line
        }}
        errors={[fields?.name.errors]}
      />
      <Field
        labelProps={{ children: 'Code' }}
        inputProps={{
          ...conform.input(fields.plu, { type: 'text' }),
          required: true,
          defaultValue: isEditing ? modifierGroups.plu : autoCode,
        }}
        errors={[fields?.plu.errors]}
      />
      <H5>Select Options</H5>
      <div className="flex flex-col border p-2 rounded-sm">
        <FlexRow>
          <input
            type="checkbox"
            {...conform.input(fields.required, { type: 'checkbox' })}
            onChange={() => setRequired(!required)}
            defaultChecked={isEditing ? modifierGroups.min : false}
          />
          <H6 variant="secondary">Required Selection</H6>
        </FlexRow>
        <Spacer spaceY="1" />

        {required ||
          (modifierGroups.min && (
            <Field
              labelProps={{}}
              inputProps={{
                ...conform.input(fields.min, { type: 'number' }),
                required: true,
                defaultValue: isEditing ? modifierGroups.min : 1,
              }}
              errors={[fields?.min.errors]}
            />
          ))}
        <FlexRow>
          <input
            type="checkbox"
            {...conform.input(fields.required, { type: 'checkbox' })}
            defaultChecked={isEditing ? modifierGroups.max : false}
            onChange={() => setMaxSelection(!maxSelection)}
          />
          <H6 variant="secondary">Maximum selection</H6>
          <Spacer size="sm" />
        </FlexRow>
        <Spacer spaceY="1" />

        {maxSelection ||
          (modifierGroups.max && (
            <Field
              labelProps={{}}
              inputProps={{
                ...conform.input(fields.max, { type: 'number' }),
                required: true,
                defaultValue: isEditing ? modifierGroups.max : 1,
              }}
              errors={[fields?.max.errors]}
            />
          ))}
      </div>
      <Spacer size="sm" />
      <CheckboxField
        labelProps={{
          children: 'Allow customers to select an item more than once',
        }}
        buttonProps={{
          ...conform.input(fields.multiMax, { type: 'number' }),
          required: true,
          defaultChecked: isEditing ? modifierGroups.multiMax : false,
        }}
        errors={[fields?.multiMax.errors]}
      />

      <Spacer size="md" />
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
      </div>
      <Spacer size="md" />
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
      </div>
      <Spacer size="md" />

      <Button size="medium" type="submit" variant="secondary" name={conform.INTENT} value={isEditing ? 'editModifierG' : 'submit'}>
        {isSubmitting
          ? isEditing
            ? 'Editing modifier Group...'
            : 'Adding modifier Group...'
          : isEditing
          ? 'Edit modifier Group'
          : 'Add modifier Group'}
      </Button>
    </>
  )
}
