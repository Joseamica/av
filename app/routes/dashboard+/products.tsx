import { useFetcher, useLoaderData } from '@remix-run/react'
import React from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { FlexRow, Spacer } from '~/components'
import { SearchBar } from '~/components/dashboard/searchbar'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')

  const products = await prisma.product.findMany({
    where: {
      branchId,
    },
    orderBy: [{ available: 'desc' }, { name: 'asc' }],
  })
  const modifierGroups = await prisma.modifierGroup.findMany({
    where: {
      branchId,
    },
    orderBy: [{ available: 'desc' }, { name: 'asc' }],
  })
  const modifiers = await prisma.modifiers.findMany({
    where: {
      branchId,
    },
    orderBy: [{ available: 'desc' }, { name: 'asc' }],
  })
  return json({ products, modifierGroups, modifiers })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const status = formData.get('status') as string
  const id = formData.get('id') as string
  const type = formData.get('type') as string

  switch (type) {
    case 'products':
      if (status === 'true') {
        await prisma.product.update({
          where: {
            id,
          },
          data: {
            available: true,
          },
        })
      } else if (status === 'false') {
        await prisma.product.update({
          where: {
            id,
          },
          data: {
            available: false,
          },
        })
      }
      break
    case 'modifiers':
      if (status === 'true') {
        await prisma.modifiers.update({
          where: {
            id,
          },
          data: {
            available: true,
          },
        })
      } else if (status === 'false') {
        await prisma.modifiers.update({
          where: {
            id,
          },
          data: {
            available: false,
          },
        })
      }
      break
    case 'modifiersG':
      if (status === 'true') {
        await prisma.modifierGroup.update({
          where: {
            id,
          },
          data: {
            available: true,
          },
        })
      } else if (status === 'false') {
        await prisma.modifierGroup.update({
          where: {
            id,
          },
          data: {
            available: false,
          },
        })
      }
      break
  }

  return json({ success: true })
}

export default function Products() {
  const data = useLoaderData()
  const [search, setSearch] = React.useState<string>('')
  const fetcher = useFetcher()
  const [active, setActive] = React.useState<string>('Productos')
  const onHandleActive = (name: string) => {
    setActive(name)
  }

  return (
    <div className="p-4">
      <FlexRow>
        <button onClick={() => onHandleActive('Productos')}>Productos</button>
        <button onClick={() => onHandleActive('GModificadores')}>Grupos Modificadores</button>
        <button onClick={() => onHandleActive('Modificadores')}>Modificadores</button>
      </FlexRow>
      <SearchBar placeholder="Buscar productos" setSearch={setSearch} />
      <Spacer spaceY="2" />
      <div className="flex flex-col space-y-2">
        {search ? (
          <>
            {data.products
              .filter(product => product.name.toLowerCase().includes(search.toLowerCase()))
              .map(product => {
                return (
                  <div key={product.id} className="space-y-2">
                    <fetcher.Form className="flex flex-row items-center gap-2" method="POST">
                      {product.available ? (
                        <button
                          className="flex flex-row items-center gap-2 px-2 py-1 border rounded-lg bg-yellow-500 text-white"
                          name="status"
                          value={'false'}
                        >
                          <FaPause /> <span>Pausar</span>
                        </button>
                      ) : (
                        <button
                          className="flex flex-row items-center gap-2 px-2 py-1 border rounded-lg bg-success text-white"
                          name="status"
                          value={'true'}
                        >
                          <FaPlay /> <span>Activar</span>
                        </button>
                      )}

                      <p>{product.name}</p>

                      <input type="hidden" name="id" value={product.id} />
                    </fetcher.Form>
                  </div>
                )
              })}
          </>
        ) : (
          <>
            {active === 'Productos' ? (
              <>
                {data.products.map(product => {
                  return (
                    <div key={product.id} className="space-y-2">
                      <fetcher.Form className="flex flex-row items-center gap-2" method="POST">
                        {product.available ? (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border rounded-lg bg-yellow-500 text-white"
                            name="status"
                            value={'false'}
                          >
                            <FaPause /> <span>Pausar</span>
                          </button>
                        ) : (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border  bg-success text-white rounded-lg"
                            name="status"
                            value={'true'}
                          >
                            <FaPlay /> <span>Activar</span>
                          </button>
                        )}

                        <p>{product.name}</p>
                        <input type="hidden" name="type" value={'products'} />

                        <input type="hidden" name="id" value={product.id} />
                      </fetcher.Form>
                    </div>
                  )
                })}
              </>
            ) : null}
            {active === 'GModificadores' ? (
              <>
                {data.modifierGroups.map(mg => {
                  return (
                    <div key={mg.id} className="space-y-2">
                      <fetcher.Form className="flex flex-row items-center gap-2" method="POST">
                        {mg.available ? (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border rounded-lg bg-yellow-500 text-white"
                            name="status"
                            value={'false'}
                          >
                            <FaPause /> <span>Pausar</span>
                          </button>
                        ) : (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border  bg-success text-white rounded-lg"
                            name="status"
                            value={'true'}
                          >
                            <FaPlay /> <span>Activar</span>
                          </button>
                        )}

                        <p>{mg.name}</p>
                        <input type="hidden" name="id" value={mg.id} />
                        <input type="hidden" name="type" value={'modifiersG'} />
                      </fetcher.Form>
                    </div>
                  )
                })}
              </>
            ) : null}
            {active === 'Modificadores' ? (
              <>
                {data.modifiers.map(modifier => {
                  return (
                    <div key={modifier.id} className="space-y-2">
                      <fetcher.Form className="flex flex-row items-center gap-2" method="POST">
                        {modifier.available ? (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border rounded-lg bg-yellow-500 text-white"
                            name="status"
                            value={'false'}
                          >
                            <FaPause /> <span>Pausar</span>
                          </button>
                        ) : (
                          <button
                            className="flex flex-row items-center gap-2 px-2 py-1 border  bg-success text-white rounded-lg"
                            name="status"
                            value={'true'}
                          >
                            <FaPlay /> <span>Activar</span>
                          </button>
                        )}

                        <p>{modifier.name}</p>
                        <input type="hidden" name="type" value={'modifiers'} />

                        <input type="hidden" name="id" value={modifier.id} />
                      </fetcher.Form>
                    </div>
                  )
                })}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
