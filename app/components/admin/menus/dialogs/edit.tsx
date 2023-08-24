import { conform } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'

import { QueryDialog } from '../../ui/dialogs/dialog'
import { Field } from '../../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { FlexRow } from '~/components/util/flexrow'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function EditMenuDialog({ form, fields, dataChild, branchChild, data }) {
  const fetcher = useFetcher()
  const [isOpen, setIsOpen] = useState(true)

  const [selectedItems, setSelectedItems] = useState(() => {
    return branchChild.filter(item => dataChild?.availabilities.some(av => av.id === item.id)).map(item => item.id)
  })
  useEffect(() => {
    setSelectedItems(branchChild.filter(item => dataChild?.availabilities.some(av => av.id === item.id)).map(item => item.id))
  }, [dataChild, branchChild])
  const toggleItem = item => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(item.id) ? prevSelectedItems.filter(i => i !== item.id) : [...prevSelectedItems, item.id],
    )
  }

  const isSubmitting = fetcher.state !== 'idle'

  return (
    <QueryDialog title="Edit menu" description="Edit the following fields" query="editItem">
      <fetcher.Form method="POST" {...form.props}>
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
          labelProps={{ htmlFor: fields.type.id, children: 'Type' }}
          inputProps={{
            ...conform.input(fields.type, { type: 'text' }),
            autoComplete: dataChild?.type,
            defaultValue: dataChild?.type,
          }}
          errors={[fields?.type.errors]}
        />
        <Field
          labelProps={{ htmlFor: fields.currency.id, children: 'Currency' }}
          inputProps={{
            ...conform.input(fields.currency, { type: 'text' }),
            autoComplete: dataChild?.currency,
            defaultValue: dataChild?.currency,
          }}
          errors={[fields?.currency.errors]}
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
        <FlexRow>
          <Field
            labelProps={{ htmlFor: fields.dayOfWeek.id, children: 'Day of the week (1 is Monday)' }}
            inputProps={{
              ...conform.input(fields.dayOfWeek, { type: 'number' }),
              autoComplete: dataChild?.dayOfWeek,
              defaultValue: dataChild?.dayOfWeek,
            }}
            errors={[fields?.dayOfWeek.errors]}
          />
          <Field
            labelProps={{ htmlFor: fields.startTime.id, children: 'Start Time' }}
            inputProps={{
              ...conform.input(fields.startTime, { type: 'time' }),
              autoComplete: dataChild?.startTime,
              defaultValue: dataChild?.startTime,
            }}
            errors={[fields?.startTime.errors]}
          />
          <Field
            labelProps={{ htmlFor: fields.endTime.id, children: 'End Time' }}
            inputProps={{
              ...conform.input(fields.endTime, { type: 'time' }),
              autoComplete: dataChild?.endTime,
              defaultValue: dataChild?.endTime,
            }}
            errors={[fields?.endTime.errors]}
          />
        </FlexRow>
        <Button size="small" type="button" className="self-end">
          Add availability
        </Button>
        <Spacer size="sm" />

        <Spacer size="sm" />
        <Button size="medium" type="submit" variant="secondary" name="_action" value="edit">
          {isSubmitting ? 'Editing menu...' : 'Edit menu'}
        </Button>
      </fetcher.Form>
    </QueryDialog>
  )
}
