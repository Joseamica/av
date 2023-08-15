import { Form, useLoaderData } from '@remix-run/react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Button, H2, LinkButton } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const userId = session.get('userId')
  const isName = session.has('username')
  const admin = await prisma.admin.findFirst({})
  const isAdmin = await prisma.admin.findFirst({
    where: {
      id: admin.id,
      user: {
        some: {
          id: userId,
        },
      },
    },
  })

  if (!isName) {
    return redirect('/')
  }
  if (isAdmin) {
    return redirect('/admin')
  }
  const tables = await prisma.table.findMany({})
  return json({ tables })
}

export async function action({ request, params }: ActionArgs) {
  const session = await getSession(request)
  const userId = session.get('userId')

  const admin = await prisma.admin.findFirst({})

  const updateUserToAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
  return redirect('/admin')
}

export default function Secret() {
  const data = useLoaderData()
  return (
    <>
      {data.tables.map((table: Table) => (
        <LinkButton size="small" key={table.id} to={`/table/${table.id}`}>
          {table.number}
        </LinkButton>
      ))}
      <Form method="post">
        {/* <label htmlFor="email">Email</label>
      <input type="email" name="email" id="email" /> */}
        <H2>MAKE ME ADMIN?</H2>
        <Button type="submit">Submit</Button>
      </Form>
    </>
  )
}
