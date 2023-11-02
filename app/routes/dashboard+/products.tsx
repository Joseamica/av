import { useFetcher, useLoaderData } from '@remix-run/react'
import React from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Spacer } from '~/components'
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
  return json({ products })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const status = formData.get('status') as string
  const id = formData.get('id') as string
  console.log('status', status)
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
  return json({ success: true })
}

export default function Products() {
  const data = useLoaderData()
  const [search, setSearch] = React.useState<string>('')
  const fetcher = useFetcher()

  return (
    <div className="p-4">
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
                    <input type="hidden" name="id" value={product.id} />
                  </fetcher.Form>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
