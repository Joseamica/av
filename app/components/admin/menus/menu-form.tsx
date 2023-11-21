import { conform } from '@conform-to/react'
import { useState } from 'react'

import { ErrorList, Field } from '../ui/forms'

import { XIcon } from '~/components/icons'
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
  const [pdfImages, setPdfImages] = useState(isEditing && editSubItemId ? menus.find(menu => menu.id === editSubItemId)?.pdfImage : [''])
  const addPdfImage = () => {
    setPdfImages([...pdfImages, ''])
  }

  // Function to handle removing an image URL input
  const removePdfImage = index => {
    const newPdfImages = pdfImages.filter((_, idx) => idx !== index)
    setPdfImages(newPdfImages)
  }

  // Function to update the state when an image URL is changed
  const updatePdfImage = (value, index) => {
    const newPdfImages = pdfImages.map((img, idx) => (idx === index ? value : img))
    setPdfImages(newPdfImages)
  }
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
      <div className="border rounded-xl bg-white p-1">
        <H5>PDF Images</H5>
        {pdfImages.map((pdf, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Field
              labelProps={{ htmlFor: `pdfImage-${index}`, children: `PDF Image ${index + 1}` }}
              inputProps={{
                ...conform.input(fields.pdfImages, { type: 'url' }),
                value: pdf,
                onChange: e => updatePdfImage(e.target.value, index),
              }}
              errors={[fields?.pdfImages.errors]}
            />
            {index > 0 && (
              <Button variant="danger" size="small" type="button" onClick={() => removePdfImage(index)}>
                <XIcon />
              </Button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPdfImage} className="border rounded-full bg-day-principal text-white p-1">
          Add Another Image
        </button>
      </div>
      <Spacer size="md" />
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
