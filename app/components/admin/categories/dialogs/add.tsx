import { conform } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'
import * as Select from '@radix-ui/react-select'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'

import { QueryDialog } from '../../ui/dialogs/dialog'
import { CheckboxField, Field } from '../../ui/forms'
import { SelectItem } from '../../ui/selectitem'

import { ChevronDownIcon, ChevronUpIcon } from '~/components/icons'
import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5, H6 } from '~/components/util/typography'

export function AddCategoryDialog({ form, fields, dataChild, branchChild, menus }) {
  const fetcher = useFetcher()
  const [isOpen, setIsOpen] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState(null)

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
    <QueryDialog title="Add Categories" description="Add the following fields" query="addItem">
      <fetcher.Form method="POST" {...form.props}>
        {/* TODO contenido add table */}
        <Field
          labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
          inputProps={{
            ...conform.input(fields.name, { type: 'text' }),
            autoComplete: dataChild?.name,
            placeholder: 'Sides',
          }}
          errors={[fields?.name.errors]}
        />
        <Field
          labelProps={{ htmlFor: fields.image.id, children: 'Image' }}
          inputProps={{
            ...conform.input(fields.image, { type: 'url' }),
            autoComplete: dataChild?.image,
            placeholder: 'https://www.example.com/image.png',
          }}
          errors={[fields?.image.errors]}
        />
        <Field
          labelProps={{ htmlFor: fields.description.id, children: 'Description' }}
          inputProps={{
            ...conform.input(fields.description, { type: 'text' }),
            autoComplete: dataChild?.description,
          }}
          errors={[fields?.description.errors]}
        />
        <CheckboxField
          labelProps={{ htmlFor: 'pdf', children: 'Category only on pdf?' }}
          buttonProps={{
            ...conform.input(fields.pdf, { type: 'checkbox' }),
          }}
          errors={fields.pdf.errors}
        />

        <Spacer spaceY="1" />
        <Select.Root name="menu" onValueChange={() => setSelectedMenu(true)}>
          <Select.Trigger
            className="inline-flex items-center justify-center rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-violet11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-violet9 outline-none"
            aria-label="Menu"
          >
            <Select.Value placeholder="Select a menu…" />
            <Select.Icon className="text-violet11">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
              <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                <ChevronUpIcon />
              </Select.ScrollUpButton>
              <Select.Viewport className="p-[5px]">
                <Select.Group>
                  {/* <Select.Label className="px-[25px] text-xs leading-[25px] text-mauve11">Meat</Select.Label> */}
                  {menus.map(menu => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <Spacer size="sm" />
        {selectedMenu ? (
          <>
            <Label>Add products to this category</Label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 text-white bg-zinc-400  text-xs rounded-full px-2 py-1"
            >
              {isOpen ? 'Hide all products' : 'Show all products'}
            </button>
            {isOpen && (
              <div className="overflow-y-scroll h-40 mt-2 border p-1 rounded-lg">
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
          </>
        ) : (
          <>
            <Label>Add products to this category</Label>
            <H6 variant="secondary">Select a menu first to add products</H6>
            <Spacer size="sm" />
          </>
        )}

        <Button size="medium" type="submit" variant="secondary" name="_action" value="add">
          {isSubmitting ? 'Adding category...' : 'Add category'}
        </Button>
      </fetcher.Form>
    </QueryDialog>
  )
}
