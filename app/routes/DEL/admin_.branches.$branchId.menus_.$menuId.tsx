import { Form, Link, useLoaderData, useNavigate, useSearchParams } from '@remix-run/react'
import { AiFillDelete, AiFillEdit } from 'react-icons/ai'
import { IoChevronBack } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { MenuCategory } from '@prisma/client'
import { prisma } from '~/db.server'

import { Button, FlexRow, H1, H3, LinkButton, Modal, Spacer } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId, menuId } = params
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: { menuCategories: true },
  })
  const searchParams = new URL(request.url).searchParams
  const categoryId = searchParams.get('categoryId')
  const editItemId = searchParams.get('editItemId') || ''

  if (categoryId) {
    const menuCategory = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: { menuItems: true },
    })
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: editItemId },
    })

    return json({ menu, menuCategory, menuItem })
  }
  const rawData = await request.text()

  return json({ menu })
}
export async function action({ request, params }: ActionArgs) {
  const { branchId, menuId } = params
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())

  const name = formData.get('name') as string
  const image = formData.get('image') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const currency = formData.get('currency') as string
  const allDay = formData.get('allDay') === 'on' ? true : false
  const type = formData.get('type') as string

  // DELETE AFTER
  const asignImageMenu = formData.get('asignImageMenu') as string
  if (asignImageMenu) {
    await prisma.menu.update({
      where: { id: menuId },
      data: {
        image:
          'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=c077af1b-4ed4-4807-a762-a9c091c1ccfa',
      },
    })
  }
  const delMenu = formData.get('delMenu') as string
  if (delMenu) {
    await prisma.menu.delete({
      where: { id: menuId },
    })
    return redirect(`/admin/branches/${branchId}/menus`)
  }

  const searchParams = new URL(request.url).searchParams
  const categoryId = searchParams.get('categoryId')
  const editItemId = searchParams.get('editItemId') || ''
  let url = new URL(request.url)

  //CREATE ITEM
  if (data.name && data.image && data.description && data.price) {
    if (data._action === 'add') {
      await prisma.menuItem.create({
        data: {
          name,
          image,
          description,
          price,
          menuCategoryId: categoryId,
          available: true,
        },
      })
      url.searchParams.delete('add')
    }
    if (data._action === 'edit' && editItemId) {
      await prisma.menuItem.update({
        where: {
          id: editItemId,
        },
        data: {
          name,
          image,
          description,
          price,
        },
      })
      url.searchParams.delete('editItemId')
    }

    return redirect(url.pathname + url.search)
    // return redirect(url.toString())
  }

  if (data._action === 'delete') {
    await prisma.menuItem.delete({
      where: {
        id: editItemId,
      },
    })
    url.searchParams.delete('editItemId')
    return redirect(url.pathname + url.search)
  }
  if (data._action === 'deleteMenu') {
    await prisma.menu.delete({
      where: {
        id: menuId,
      },
    })
    url.searchParams.delete('delMenu')
    return redirect(url.pathname + url.search)
  }
  if (data._action === 'editMenu') {
    const menuData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        return typeof value === 'string' && value !== '' && key !== '_action' && !value.includes('[object')
      }),
    )

    await prisma.menu.update({
      where: {
        id: menuId,
      },
      data: {
        ...menuData,
        allday: data.allday === 'on' ? true : false,
      },
    })
  }
  if (data._action === 'addCategory') {
    await prisma.menuCategory.create({
      data: {
        name: data.name.toString(),
        menuId: menuId,
      },
    })
  }

  return json({ success: true })
}

export const handle = {
  breadcrumb: () => <Link to="/parent/child">Categories</Link>,
}

export default function AdminMenuId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const editItemId = searchParams.get('editItemId') || ''
  const add = searchParams.get('add')
  const del = searchParams.get('del')
  const addMenu = searchParams.get('addMenu')
  const addItem = searchParams.get('addItem')

  return (
    <Form method="post" className="space-y-2">
      {!categoryId ? (
        <div>
          <FlexRow>
            {/* <LinkButton size="icon" variant="icon" to={``}>
              <IoChevronBack />
            </LinkButton> */}
            <H1 className="shrink-0">{data.menu.name}</H1>
            <Link to={`?editMenu=true`}>
              <AiFillEdit />
            </Link>
            <Link to={`?delMenu=true`}>
              <AiFillDelete />
            </Link>
          </FlexRow>
          <Spacer spaceY="2" />
          <div className="space-x-1 space-y-2">
            {data.menu.menuCategories.map((category: MenuCategory) => (
              <FlexRow key={category.id}>
                <LinkButton size="small" to={`?categoryId=${category.id}`}>
                  {category.name}
                </LinkButton>
                <Link to={`?categoryId=${category.id}&edit=true`}>
                  <AiFillEdit />
                </Link>
                <Link to={`?categoryId=${category?.id}&del=true`}>
                  <AiFillDelete />
                </Link>
              </FlexRow>
            ))}
          </div>
          <Spacer spaceY="2" />
          <LinkButton to="?addCategory=true">Add Category</LinkButton>
          {searchParams.get('addCategory') && (
            <Modal
              onClose={() => {
                searchParams.delete('addCategory')
                setSearchParams(searchParams)
              }}
              title="Add category"
            >
              <div className="p-2 space-y-2">
                <label>Name</label>
                <input type="text" name="name" />
                <Button name="_action" value="addCategory" fullWith={true} type="submit">
                  Submit
                </Button>
              </div>
            </Modal>
          )}
          {searchParams.get('editMenu') && (
            <Modal
              onClose={() => {
                searchParams.delete('editMenu')
                setSearchParams(searchParams)
              }}
              title="Edit menu"
            >
              <div className="p-2 space-y-2">
                {Object.entries(data.menu)
                  .filter(([key, value]) => key !== 'id' && key !== 'menuCategories') // Exclude 'id' from the keys
                  .map(([key, value]) => {
                    if (typeof value === 'boolean') {
                      return (
                        <FlexRow key={key}>
                          <label>{key}</label>
                          <input type="checkbox" name={key} defaultChecked={value} className="w-5 h-5" />
                        </FlexRow>
                      )
                    } else {
                      return (
                        <FlexRow key={key}>
                          <label className="capitalize">{key}</label>
                          <input
                            type="text"
                            name={key}
                            defaultValue={value}
                            className="w-full p-2 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
                          />
                        </FlexRow>
                      )
                    }
                  })}
                <Button name="_action" value="editMenu" fullWith={true}>
                  Edit menu
                </Button>
              </div>
            </Modal>
          )}
          {searchParams.get('delMenu') && (
            <Modal
              onClose={() => {
                searchParams.delete('delMenu')
                setSearchParams(searchParams)
              }}
              title="Delete menu"
            >
              <div className="p-2 space-y-3 bg-white">
                <p>Are you sure you want to delete this menu?</p>
                <Button variant="danger" name="_action" value="deleteMenu" fullWith={true}>
                  Eliminar
                </Button>
              </div>
            </Modal>
          )}
          {addMenu && (
            <Modal title="Agregar menu" onClose={() => navigate(``)}>
              <label htmlFor="name" className="capitalize">
                Nombre
              </label>
              <input
                type="text"
                required
                name="name"
                id="name"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="type" className="capitalize">
                Tipo de menu
              </label>
              <input
                type="text"
                required
                name="type"
                id="type"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="image" className="capitalize">
                Imagen
              </label>
              <input
                type="url"
                required
                name="image"
                id="image"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="currency" className="capitalize">
                Moneda
              </label>
              <input
                type="text"
                required
                name="currency"
                id="currency"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
                placeholder="euro"
              />
              <label htmlFor="allDay" className="capitalize">
                Todo el dia?
              </label>
              <input
                type="checkBox"
                required
                name="allDay"
                id="allDay"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <Button name="_action" value="createMenu">
                Crear menu
              </Button>
            </Modal>
          )}
        </div>
      ) : (
        <div>
          <FlexRow>
            <LinkButton size="icon" variant="icon" to={``}>
              <IoChevronBack />
            </LinkButton>
            <H1 className="shrink-0">{data.menuCategory.name}</H1>
            <LinkButton size="small" to={`?categoryId=${data.menuCategory.id}&addItem=true`}>
              Agregar
            </LinkButton>
          </FlexRow>
          <Spacer spaceY="2" />
          <div>
            {data.menuCategory.menuItems.map((item: any) => (
              <FlexRow key={item.id}>
                <H3>{item.name}</H3>
                <Link to={`?categoryId=${data.menuCategory.id}&editItemId=${item.id}`}>
                  <AiFillEdit />
                </Link>
                <Link to={`?categoryId=${data.menuCategory.id}&editItemId=${item.id}&del=true`}>
                  <AiFillDelete />
                </Link>
              </FlexRow>
            ))}
          </div>

          {/* MODALS */}
          {addItem && (
            <Modal title="Agregar platillo" onClose={() => navigate(`?categoryId=${data.menuCategory.id}`)}>
              <label htmlFor="addItemImage" className="capitalize">
                Imagen
              </label>
              <input
                type="url"
                name="addItemImage"
                id="addItemImage"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="addItemName" className="capitalize">
                Nombre
              </label>
              <input
                type="text"
                name="addItemName"
                id="addItemName"
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <Button name="_action" value="addItem" type="submit">
                Editar
              </Button>
            </Modal>
          )}
          {editItemId && !del && (
            <Modal title="Editar platillo" onClose={() => navigate(`?categoryId=${data.menuCategory.id}`)}>
              <label htmlFor="name" className="capitalize">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={data.menuItem?.name}
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="image" className="capitalize">
                Imagen
              </label>
              <input
                type="url"
                name="image"
                id="image"
                defaultValue={data.menuItem?.image}
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="description" className="capitalize">
                Descripcion
              </label>
              <input
                type="text"
                name="description"
                id="description"
                defaultValue={data.menuItem?.description}
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="price" className="capitalize">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                id="price"
                defaultValue={data.menuItem?.price}
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <Button name="_action" value="edit" type="submit">
                Editar
              </Button>
            </Modal>
          )}
          {editItemId && del && (
            <Modal title="Eliminar platillo" onClose={() => navigate(`?categoryId=${data.menuCategory.id}`)}>
              <p>¿Estas seguro de eliminar este platillo?</p>
              <Button name="_action" value="delete" variant="danger">
                Delete
              </Button>
            </Modal>
          )}
          {add && (
            <Modal title="Agregar platillo" onClose={() => navigate(`?categoryId=${data.menuCategory.id}`)}>
              <label htmlFor="name" className="capitalize">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="image" className="capitalize">
                Imagen
              </label>
              <input
                type="url"
                name="image"
                id="image"
                required
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="description" className="capitalize">
                Descripcion
              </label>
              <input
                type="text"
                name="description"
                id="description"
                required
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <label htmlFor="price" className="capitalize">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                id="price"
                required
                className="w-full rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
              />
              <Button name="_action" value="add" type="submit">
                Create
              </Button>
            </Modal>
          )}
        </div>
      )}
    </Form>
  )
}
