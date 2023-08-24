import { conform } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'

import { ErrorList, Field } from '../ui/forms'

import { Button } from '~/components/ui/buttons/button'
import { Spacer } from '~/components/util/spacer'
import { H5 } from '~/components/util/typography'

export function UserForm({
  intent,
  fields,
  users,
  isSubmitting,
  editSubItemId,
  addingData,
}: {
  intent: 'add' | 'edit'
  fields: any
  users: any
  isSubmitting: boolean
  editSubItemId?: string
  addingData?: any
}) {
  const isEditing = intent === 'edit'
  // console.log('users', users)
  return (
    <>
      <Field
        labelProps={{ children: 'Name' }}
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.name : '',
          type: 'text',
        }}
        errors={fields.name.errors}
      />
      <Field
        labelProps={{ children: 'Email' }}
        inputProps={{
          ...conform.input(fields.email),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.email : '',
          type: 'email',
        }}
        errors={fields.email.errors}
      />
      <Field
        labelProps={{ children: 'Password' }}
        inputProps={{
          ...conform.input(fields.password),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.password : '',
          type: 'password',
        }}
        errors={fields.password.errors}
      />
      <Field
        labelProps={{ children: 'Color' }}
        inputProps={{
          ...conform.input(fields.color),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.color : '',
          type: 'color',
        }}
        errors={fields.color.errors}
      />
      <Field
        labelProps={{ children: 'Paid' }}
        inputProps={{
          ...conform.input(fields.paid),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.paid : '',
          type: 'number',
        }}
        errors={fields.paid.errors}
      />
      <Field
        labelProps={{ children: 'Tip' }}
        inputProps={{
          ...conform.input(fields.tip),
          defaultValue: isEditing ? users.find(user => user.id === editSubItemId)?.tip : '',
          type: 'number',
        }}
        errors={fields.tip.errors}
      />

      <Label htmlFor="role">Choose role:</Label>
      <div className="min-h-[32px] pb-3 pt-1">
        <select
          {...conform.input(fields.role)}
          className=" flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
          defaultValue={isEditing ? users.find(user => user.id === editSubItemId)?.role : ''}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      {/* TODO add ability to add to multiple keyss */}
      <Label htmlFor="selectItems">Choose a order:</Label>
      <div>
        {addingData?.data.map(keys => {
          return (
            <label key={keys.id} className="flex space-x-2 items-center">
              <input
                type="checkbox"
                {...conform.input(fields.selectItems, { type: 'checkbox' })}
                name="selectItems"
                value={keys.id}
                defaultChecked={isEditing ? users.find(user => user.id === editSubItemId)?.menuId === keys.id : false}
              />
              <H5>{keys[addingData.keys]}</H5>
            </label>
          )
        })}
        {fields.selectItems.errors && <ErrorList errors={fields.selectItems.errors} />}
      </div>
      <Spacer size="md" />
      <Button size="medium" type="submit" variant="secondary">
        {isSubmitting ? (isEditing ? 'Editing user...' : 'Adding user...') : isEditing ? 'Edit user' : 'Add user'}
      </Button>
    </>
  )
}
