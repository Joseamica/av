import type {Table, User} from '@prisma/client'
import {ActionArgs, json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {Form, Link, useLoaderData, useSearchParams} from '@remix-run/react'
import {Button, FlexRow, H1, H2, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'
import {AiFillEdit, AiFillDelete} from 'react-icons/ai'
import {Modal} from '~/components/modals'

export async function action({request, params}: ActionArgs) {
  const {branchId, userId} = params
  const formData = await request.formData()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const _action = formData.get('_action') as string
  const isAdmin = formData.get('isAdmin') === 'on' ? 'admin' : null
  console.log('isAdmin', isAdmin)

  if (_action === 'deleteUser') {
    await prisma.user.delete({
      where: {id: userId},
    })
  }
  if (_action === 'updateUser') {
    await prisma.user.update({
      where: {id: userId},
      data: {
        name,
        email,
        role: isAdmin,
      },
    })
  }

  return json({success: true})
}

export async function loader({request, params}: LoaderArgs) {
  const {branchId, userId} = params
  const user = await prisma.user.findUnique({where: {id: userId}})
  return json({user})
}

export default function AdminUserId() {
  const data = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const editUser = searchParams.get('editUser')
  const delUser = searchParams.get('delUser')
  const onClose = () => {
    searchParams.delete('editUser')
    searchParams.delete('delUser')

    setSearchParams(searchParams)
  }
  return (
    <div>
      <FlexRow>
        {/* <LinkButton size="icon" variant="icon" to={``}>
              <IoChevronBack />
            </LinkButton> */}
        <H1 className="shrink-0">{data.user.name}</H1>
        <Link to={`?editUser=true`}>
          <AiFillEdit />
        </Link>
        <Link to={`?delUser=true`}>
          <AiFillDelete />
        </Link>
      </FlexRow>
      <H2>{data.user.email}</H2>
      <H2>{data.user.phone}</H2>
      <H2>Role: {data.user.role || 'Common user'}</H2>
      {/* {data.users.map((user: User) => (
        <LinkButton size="small" key={user.id} to={user.id}>
          {user.name}
        </LinkButton>
      ))} */}
      <Modal
        isOpen={editUser === 'true'}
        title="Edit User"
        handleClose={onClose}
      >
        <Form method="POST" className="bg-white p-2">
          <div className="flex flex-col space-y-2">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={data.user.name}
              className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full border border-day-principal p-2"
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={data.user.email}
              className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full border border-day-principal p-2"
            />
            {/* {data.user.role !== 'admin' && ( */}
            <FlexRow>
              <label htmlFor="isAdmin">Admin?</label>
              <input
                type="checkbox"
                name="isAdmin"
                id="isAdmin"
                defaultChecked={data.user.role === 'admin' ? true : false}
              />
            </FlexRow>
            {/* )} */}
          </div>
          <Spacer spaceY="2" />
          <Button type="submit" fullWith={true} name="_action" value="proceed">
            Submit
          </Button>
        </Form>
      </Modal>
      <Modal
        isOpen={delUser === 'true'}
        title="Delete User"
        handleClose={onClose}
      >
        <div className="space-y-3 bg-white p-2">
          <p>Are you sure you want to delete this user?</p>
          <Button
            variant="danger"
            name="_action"
            value="deleteUser"
            fullWith={true}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
