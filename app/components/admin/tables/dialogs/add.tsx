import { conform } from '@conform-to/react'
import { useFetcher } from '@remix-run/react'

import { QueryDialog } from '../../ui/dialogs/dialog'
import { Field } from '../../ui/forms'

import { Button } from '~/components/ui/buttons/button'

export function AddTableDialog({ form, fields, table }) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const errors = fetcher.data

  return (
    <QueryDialog title="Add Table" description="Add the following fields" query="addItem">
      <fetcher.Form method="POST" {...form.props}>
        <Field
          labelProps={{ htmlFor: fields.number.id, children: 'Table Number' }}
          inputProps={{
            ...conform.input(fields.number, { type: 'number' }),
            autoComplete: table?.number,
            defaultValue: table?.number,
          }}
          errors={[errors?.number]}
        />
        <Field
          labelProps={{ htmlFor: 'seats', children: '# of Seats' }}
          inputProps={{
            ...conform.input(fields.seats, { type: 'number' }),
            autoComplete: table?.seats,
            defaultValue: table?.seats,
          }}
          errors={[errors?.seats]}
        />
        <Button size="medium" type="submit" variant="secondary" name="_action" value="add">
          {isSubmitting ? 'Adding tables...' : 'Add table'}
        </Button>
      </fetcher.Form>
    </QueryDialog>
  )
}
