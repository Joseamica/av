import { conform } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'
import { Link } from '@remix-run/react'

import { ErrorList, Field } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5, H6 } from '~/components/util/typography'

export function EmployeeForm({
  intent,
  fields,
  employees,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  employees: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'
  // console.log('employees', employees)
  return (
    <>
      <Field
        labelProps={{ children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: isEditing ? employees.find(employee => employee.id === editSubItemId)?.name : '',
          type: 'text',
        }}
        errors={fields.name.errors}
      />

      <Label htmlFor="role" className="text-sm">
        Choose role:
      </Label>

      <div className="min-h-[32px] pb-3 pt-1">
        <select
          {...conform.input(fields.role)}
          className="flex w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          defaultValue={isEditing ? employees.find(employee => employee.id === editSubItemId)?.role : ''}
        >
          <option value="waiter">Waiter</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <Spacer size="sm" />
      {/* <Field
        labelProps={{ children: 'Email' }}
        inputProps={{
          ...conform.input(fields.email),
          defaultValue: isEditing ? employees.find(employee => employee.id === editSubItemId)?.email : '',
          type: 'email',
        }}
        errors={fields.email.errors}
      />
      {!isEditing && (
        <Field
          labelProps={{ children: 'Password' }}
          inputProps={{
            ...conform.input(fields.password),
            type: 'password',
          }}
          errors={fields.password.errors}
        />
      )} */}
      <Field
        labelProps={{ children: 'Codigo' }}
        inputProps={{
          ...conform.input(fields.code),
          defaultValue: isEditing ? employees.find(employee => employee.id === editSubItemId)?.code : '',
          maxLength: 4,

          type: 'number',
        }}
        errors={fields.code.errors}
      />
      <H6 variant="secondary">
        <Link to="https://www.twilio.com/docs/glossary/what-e164">Format: 5215512956265, Click here for more info.</Link>
      </H6>
      <Field
        labelProps={{ children: 'Phone' }}
        inputProps={{
          ...conform.input(fields.phone),
          defaultValue: isEditing ? employees.find(employee => employee.id === editSubItemId)?.phone : '',
          type: 'phone',
        }}
        errors={fields.color.errors}
      />
      <Field
        labelProps={{ children: 'Image' }}
        inputProps={{
          ...conform.input(fields.image),
          defaultValue: isEditing ? employees.find(employee => employee.id === editSubItemId)?.image : '',
          type: 'url',
        }}
        errors={fields.image.errors}
      />

      {/* TODO add ability to add to multiple keyss */}
      <Label htmlFor="selectItems">Choose a table:</Label>
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...conform.input(fields.selectItems, { type: 'checkbox' })}
                name="selectItems"
                id={keys.id}
                value={keys.id}
                defaultChecked={
                  isEditing ? employees.find(employee => employee.id === editSubItemId)?.tables?.find(table => table.id === keys.id) : ''
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
        {isSubmitting ? (isEditing ? 'Editing employee...' : 'Adding employee...') : isEditing ? 'Edit employee' : 'Add employee'}
      </Button>
    </>
  )
}
