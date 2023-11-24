import { Form, Link, Outlet, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import React from 'react'
import { FaEdit, FaPause, FaPlay } from 'react-icons/fa'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'

import { Button, FlexRow, H1, H2, H4, Modal, Spacer } from '~/components'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { branchId, modifierGId } = params
  const modifierGroup = await prisma.modifierGroup.findFirst({
    where: {
      id: modifierGId,
    },
    include: {
      products: true,
      modifiers: true,
    },
  })
  const categories = await prisma.category.findMany({ where: { branchId }, include: { products: true } })
  // const products = await prisma.product.findMany({
  //   where: {
  //     branchId,
  //   },
  // })
  return json({ modifierGroup, categories })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const { modifierGId } = params
  const products = formData.getAll('products') as string[]
  const isAvailable = formData.get('isAvailable')
  console.log('isAvailable', isAvailable)
  if (isAvailable === 'true') {
    await prisma.modifierGroup.update({
      where: {
        id: modifierGId,
      },
      data: {
        available: false,
      },
    })
  } else if (isAvailable === 'false') {
    await prisma.modifierGroup.update({
      where: {
        id: modifierGId,
      },
      data: {
        available: true,
      },
    })
  }

  if (products.length > 0) {
    await prisma.modifierGroup.update({
      where: {
        id: modifierGId,
      },
      data: {
        products: {
          set: [],
        },
      },
    })

    await prisma.modifierGroup.update({
      where: {
        id: modifierGId,
      },
      data: {
        products: {
          connect: products.map(id => ({ id })),
        },
      },
    })
  }

  return json({ success: true })
}

export default function ModifierId() {
  const data = useLoaderData()

  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  return (
    <>
      <Modal className="p-4" onClose={() => navigate(-1)} title={data.modifierGroup.name}>
        <div className="p-2">
          <FlexRow>
            <H2>Estado</H2>
            <div
              className={clsx('h-3 w-3 rounded-full', {
                'bg-green-500': data.modifierGroup.available,
                'bg-red-500': !data.modifierGroup.available,
              })}
            />
          </FlexRow>

          <fetcher.Form className="flex flex-row justify-around space-x-2" method="POST">
            <button
              className="flex flex-row items-center px-2 py-1 space-x-2 border rounded-lg"
              disabled={isSubmitting}
              name="isAvailable"
              value={data.modifierGroup.available}
            >
              {data.modifierGroup.available ? (
                <>
                  <p>Pausar</p>
                  <FaPause />
                </>
              ) : (
                <>
                  <p>Resumir</p>
                  <FaPlay className="fill-green-300" />
                </>
              )}
            </button>
            <Link to="edit" className="flex flex-row items-center px-2 py-1 space-x-2 border rounded-lg">
              <p>Editar</p>
              <FaEdit />
            </Link>
          </fetcher.Form>

          <Spacer spaceY="2" />
          <fetcher.Form method="POST" className="p-1 border rounded-lg">
            <H2>Productos</H2>
            <div className="p-2 overflow-scroll h-96">
              {data.categories?.map(category => {
                return (
                  <div key={category.id}>
                    {category.products.length > 0 ? (
                      <>
                        <H2 className="underline">{category.name}</H2>
                        <Spacer spaceY="1" />
                      </>
                    ) : null}

                    <div>
                      {category.products.map(product => {
                        return (
                          <div key={product.id} className="flex items-center space-x-2">
                            <label htmlFor="product">
                              <input
                                id="product"
                                className="w-5 h-5"
                                type="checkbox"
                                name="products"
                                value={product.id}
                                defaultChecked={data.modifierGroup.products?.some(p => p.id === product.id)}
                              />
                            </label>
                            <span> {product.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <Button disabled={isSubmitting}>Agregar grupo a productos seleccionados</Button>
            {/* <input type="hidden" name="modifierGroupId" value={modifierGroupId} /> */}
          </fetcher.Form>
        </div>
      </Modal>
      <Outlet />
    </>
  )
}
