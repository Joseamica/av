import { conform } from '@conform-to/react'

import { CheckboxField, ErrorList, Field } from '../ui/forms'
import { Label } from '../ui/label'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H4, H5 } from '~/components/util/typography'

export function PaymentForm({
  intent,
  fields,
  payments,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  payments: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'

  return (
    <>
      <Label htmlFor="method">Choose a payment method:</Label>
      <div className="min-h-[32px] pb-3 pt-1">
        <select
          {...conform.input(fields.method)}
          className=" flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
      </div>
      <Field
        labelProps={{ children: 'Amount' }}
        inputProps={{
          ...conform.input(fields.amount),
          defaultValue: isEditing ? payments.find(payment => payment.id === editSubItemId)?.amount : '',
          type: 'number',
        }}
        errors={fields.amount.errors}
      />
      <Field
        labelProps={{ children: 'Tip' }}
        inputProps={{
          ...conform.input(fields.tip),
          defaultValue: isEditing ? payments.find(payment => payment.id === editSubItemId)?.tip : '',
          type: 'number',
        }}
        errors={fields.tip.errors}
      />
      <Field
        labelProps={{ children: 'Total' }}
        inputProps={{
          ...conform.input(fields.total),
          defaultValue: isEditing ? payments.find(payment => payment.id === editSubItemId)?.total : '',
          type: 'number',
        }}
        errors={fields.total.errors}
      />

      <Spacer size="md" />
      <H4 variant="secondary" className="underline">
        Add this payment to an order
      </H4>
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex space-x-2 items-center">
              <input
                type="radio"
                {...conform.input(fields.selectItems, { type: 'radio' })}
                name="selectItems"
                value={keys.id}
                defaultChecked={isEditing ? payments.find(payment => payment.id === editSubItemId)?.orderId === keys.id : false}
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting ? (isEditing ? 'Editing payment...' : 'Adding payment...') : isEditing ? 'Edit payment' : 'Add payment'}
      </Button>
    </>
  )
}
