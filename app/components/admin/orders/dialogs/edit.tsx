import { conform } from '@conform-to/react'
import { useFetcher } from '@remix-run/react'

import { QueryDialog } from '../../ui/dialogs/dialog'
import { CheckboxField, Field } from '../../ui/forms'

import { Button } from '~/components/ui/buttons/button'

export function EditOrderDialog({ form, fields, order }) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const errors = fetcher.data
  return (
    <QueryDialog title="Edit Order" description="Edit the following fields" query="editItem">
      <fetcher.Form method="POST" {...form.props}>
        <Field
          labelProps={{ htmlFor: fields.tip.id, children: 'Tip' }}
          inputProps={{
            ...conform.input(fields.tip, { type: 'number' }),
            autoComplete: order?.tip ?? 0,
            defaultValue: order?.tip ?? 0,
          }}
          errors={[fields?.tip.errors]}
        />
        <CheckboxField
          labelProps={{ htmlFor: 'paid', children: 'Order is paid?' }}
          buttonProps={{
            ...conform.input(fields.paid, { type: 'checkbox' }),
            defaultChecked: order?.paid ?? false,
          }}
          errors={fields.paid.errors}
        />
        <Field
          labelProps={{ htmlFor: fields.total.id, children: 'Total amount' }}
          inputProps={{
            ...conform.input(fields.total, { type: 'number' }),
            autoComplete: order?.total ?? 0,
            defaultValue: order?.total ?? 0,
          }}
          errors={[fields?.total.errors]}
        />
        <Field
          labelProps={{ htmlFor: 'creationDate', children: 'creationDate' }}
          inputProps={{
            ...conform.input(fields.creationDate, { type: 'date' }),
            defaultValue: order?.creationDate ? new Date(order.creationDate).toISOString().split('T')[0] : '',
          }}
          errors={[errors?.paid]}
        />
        {order?.paid && (
          <Field
            labelProps={{ htmlFor: 'paidDate', children: 'paidDate' }}
            inputProps={{
              ...conform.input(fields.paidDate, { type: 'date' }),
              defaultValue: order?.paidDate ? new Date(order.paidDate).toISOString().split('T')[0] : '',
            }}
            errors={[errors?.paid]}
          />
        )}
        <CheckboxField
          labelProps={{ htmlFor: 'active', children: 'Order is active?' }}
          buttonProps={{
            ...conform.input(fields.active, { type: 'checkbox' }),
            defaultChecked: order?.active ?? false,
          }}
          errors={fields.active.errors}
        />
        <Button size="medium" type="submit" variant="secondary" name="_action" value="edit">
          {isSubmitting ? 'Edit order...' : 'Edit order'}
        </Button>
        <Button size="medium" type="submit" variant="secondary" name="_action" value="delete">
          {isSubmitting ? 'Delete order...' : 'Delete order'}
        </Button>
      </fetcher.Form>
    </QueryDialog>
  )
}
