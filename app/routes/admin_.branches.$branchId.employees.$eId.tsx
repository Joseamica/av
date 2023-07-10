import {json, type ActionArgs, type LoaderArgs} from '@remix-run/node'
import {Form, Link, useLoaderData, useSearchParams} from '@remix-run/react'
import {AiFillDelete, AiFillEdit} from 'react-icons/ai'
import {Button, FlexRow, H1, H2, Spacer} from '~/components'
import {Modal} from '~/components/modals'
import {prisma} from '~/db.server'

export async function action({request, params}: ActionArgs) {
  const {branchId, eId} = params
  const formData = await request.formData()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const image = formData.get('image') as string
  const isAdmin = formData.get('isAdmin') === 'on' ? 'admin' : null

  await prisma.employee.update({
    where: {id: eId},
    data: {
      name,
      email,
      // role:"admin"
      image: 'https://i.pravatar.cc/300',
      phone,
    },
  })

  return json({success: true})
}

export async function loader({request, params}: LoaderArgs) {
  const {branchId, eId} = params
  const employee = await prisma.employee.findUnique({where: {id: eId}})
  return json({employee})
}

export default function AdminUserId() {
  const data = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const editEmployee = searchParams.get('editEmployee')
  const delEmployee = searchParams.get('delEmployee')
  const onClose = () => {
    searchParams.delete('editEmployee')
    searchParams.delete('delEmployee')
    setSearchParams(searchParams)
  }
  return (
    <div>
      <FlexRow>
        {/* <LinkButton size="icon" variant="icon" to={``}>
              <IoChevronBack />
            </LinkButton> */}
        <H1 className="shrink-0">{data.employee.name}</H1>
        <Link to={`?editEmployee=true`}>
          <AiFillEdit />
        </Link>
        <Link to={`?delEmployee=true`}>
          <AiFillDelete />
        </Link>
      </FlexRow>
      <img src={data.img} className="h-10 w-10" />
      <H2>{data.employee.email}</H2>
      <H2>{data.employee.phone}</H2>
      <H2>Role: {data.employee.role || 'Common employee'}</H2>
      {/* {data.employees.map((employee: employee) => (
        <LinkButton size="small" key={employee.id} to={employee.id}>
          {employee.name}
        </LinkButton>
      ))} */}
      <Modal isOpen={editEmployee === 'true'} title="Edit employee" handleClose={onClose}>
        <Form method="POST" className="bg-white p-2">
          <div className="flex flex-col space-y-2">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={data.employee.name}
              className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full border border-day-principal p-2"
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={data.employee.email}
              className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full border border-day-principal p-2"
            />
            {/* {data.employee.role !== 'admin' && ( */}
            <FlexRow>
              <label htmlFor="isAdmin">Admin?</label>
              <input
                type="checkbox"
                name="isAdmin"
                id="isAdmin"
                defaultChecked={data.employee.role === 'admin' ? true : false}
              />
            </FlexRow>
            {/* )} */}
          </div>
          <Spacer spaceY="2" />
          <Button type="submit" fullWith={true}>
            Submit
          </Button>
        </Form>
      </Modal>
      <Modal isOpen={delEmployee === 'true'} title="Delete employee" handleClose={onClose}>
        <div className="space-y-3 bg-white p-2">
          <p>Are you sure you want to delete this employee?</p>
          <Button variant="danger" name="_action" value="deleteUser" fullWith={true}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
