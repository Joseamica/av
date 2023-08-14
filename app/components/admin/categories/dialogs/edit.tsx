import { conform } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'

import { QueryDialog } from '../../ui/dialogs/dialog'
import { CheckboxField, Field } from '../../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function EditCategoryDialog({ form, fields, dataChild, branchChild }) {
  const fetcher = useFetcher()
  const [isOpen, setIsOpen] = useState(true)
  const [selectedItems, setSelectedItems] = useState(() => {
    return branchChild.filter(item => dataChild?.menuItems.some(menuItem => menuItem.id === item.id)).map(item => item.id)
  })
  useEffect(() => {
    setSelectedItems(branchChild.filter(item => dataChild?.menuItems.some(menuItem => menuItem.id === item.id)).map(item => item.id))
  }, [dataChild, branchChild])
  const toggleItem = item => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(item.id) ? prevSelectedItems.filter(i => i !== item.id) : [...prevSelectedItems, item.id],
    )
  }

  const isSubmitting = fetcher.state !== 'idle'

  return (
    <QueryDialog title="Edit Category" description="Edit the following fields" query="editItem">
      <fetcher.Form method="POST" {...form.props}>
        {/* TODO contenido add table */}
        <Field
          labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
          inputProps={{
            ...conform.input(fields.name, { type: 'text' }),
            autoComplete: dataChild?.name,
            defaultValue: dataChild?.name,
          }}
          errors={[fields?.name.errors]}
        />
        <Field
          labelProps={{ htmlFor: fields.image.id, children: 'Image' }}
          inputProps={{
            ...conform.input(fields.image, { type: 'url' }),
            autoComplete: dataChild?.image,
            defaultValue: dataChild?.image,
          }}
          errors={[fields?.image.errors]}
        />
        <Field
          labelProps={{ htmlFor: fields.description.id, children: 'Description' }}
          inputProps={{
            ...conform.input(fields.description, { type: 'text' }),
            autoComplete: dataChild?.description,
            defaultValue: dataChild?.description,
          }}
          errors={[fields?.description.errors]}
        />
        <CheckboxField
          labelProps={{ htmlFor: 'pdf', children: 'Category only on pdf?' }}
          buttonProps={{
            ...conform.input(fields.pdf, { type: 'checkbox' }),
            defaultChecked: dataChild?.pdf ?? false,
          }}
          errors={fields.pdf.errors}
        />
        <Label>Add products to this category</Label>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="ml-2 text-white bg-zinc-400  text-xs rounded-full px-2 py-1">
          {isOpen ? 'Hide all products' : 'Show all products'}
        </button>
        {isOpen && (
          <div className="overflow-y-scroll h-40 mt-2">
            {branchChild
              .sort((a, b) => (selectedItems.includes(b.id) ? 1 : -1) - (selectedItems.includes(a.id) ? 1 : -1))
              .map(item => (
                <label key={item.id} className="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item)}
                    name="selectedItems"
                    value={item.id}
                  />
                  <H5>{item.name}</H5>
                </label>
              ))}
          </div>
        )}
        <Spacer size="sm" />

        <Button size="medium" type="submit" variant="secondary" name="_action" value="edit">
          {isSubmitting ? 'Editing category...' : 'Edit category'}
        </Button>
      </fetcher.Form>
    </QueryDialog>
  )
}
