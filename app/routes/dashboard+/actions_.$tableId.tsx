import * as Separator from '@radix-ui/react-separator'
import { useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import React, { useEffect, useState } from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { Modifiers } from '@prisma/client'
import clsx from 'clsx'
import { prisma } from '~/db.server'

import { getBranchId } from '~/models/branch.server'
import { getDayOfWeek, getMenu } from '~/models/menu.server'

import { EVENTS } from '~/events'

import { formatCurrency, getHour } from '~/utils'

import { Button, CheckIcon, FlexRow, H1, H3, H4, H5, H6, Modal, SendComments, Spacer } from '~/components'
import { SearchBar } from '~/components/dashboard/searchbar'
import { ErrorList } from '~/components/forms'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  const branchId = await getBranchId(tableId)
  const timeNow = getHour()
  const dayOfWeekNow = getDayOfWeek()

  const menu = await getMenu(branchId)
  // const menu = await prisma.menu.findFirst({
  //   where: {
  //     branchId,
  //     availabilities: {
  //       some: {
  //         dayOfWeek: dayOfWeekNow,
  //         OR: [
  //           {
  //             AND: [
  //               {
  //                 startTime: {
  //                   lte: String(timeNow),
  //                 },
  //               },
  //               {
  //                 endTime: {
  //                   gte: String(timeNow),
  //                 },
  //               },
  //             ],
  //           },
  //           {
  //             AND: [
  //               {
  //                 startTime: {
  //                   lte: String(timeNow),
  //                 },
  //               },
  //               {
  //                 endTime: {
  //                   gte: String(timeNow),
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   },
  //   include: {
  //     availabilities: true,
  //     categories: {
  //       orderBy: {
  //         displayOrder: 'asc',
  //       },
  //       include: {
  //         products: {
  //           include: {
  //             modifierGroups: {
  //               include: {
  //                 modifiers: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  // const table = await prisma.table.findUnique({
  //   where: {
  //     id: tableId,
  //   },
  //   include: {
  //     branch: true,
  //     users: true,
  //     order: {
  //       include: {
  //         cartItems: {
  //           include: {
  //             product: {
  //               include: {
  //                 category: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  const categories = await prisma.category.findMany({
    where: { menu: { some: { id: menu.id } } },
    orderBy: {
      displayOrder: 'asc',
    },
    include: {
      products: {
        where: {
          available: true,
        },
        include: {
          modifierGroups: {
            where: { available: true },
            include: {
              modifiers: { where: { available: true } },
            },
          },
        },
      },
    },
  })

  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
    },
  })

  const cartItems = await prisma.cartItem.findMany({
    where: {
      order: {
        tableId: tableId,
      },
    },
    include: { user: true },
  })

  return json({ cartItems, table, categories })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const productId = formData.get('productId') as string
  const productQuantity = Number(formData.get('productQuantity'))
  const modifiers = JSON.parse(formData.get('modifiers') as string)
  const sendComments = formData.get('sendComments') as string
  const branchId = await getBranchId(params.tableId)

  const modifiersTotal = modifiers.reduce((acc, modifier) => {
    return acc + modifier.extraPrice * modifier.quantity
  }, 0)

  // Check if there's an existing order for a given tableId and create one if not exists
  let order = await prisma.order.findFirst({
    where: {
      tableId: params.tableId,
      active: true,
    },
  })

  if (!order) {
    order = await prisma.order.create({
      data: {
        total: 0,
        active: true,
        paid: false,
        branch: {
          connect: {
            id: branchId,
          },
        },
        table: {
          connect: {
            id: params.tableId,
          },
        },
      },
    })
  }

  // Fetch the product details
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

  if (!product) {
    return json({ success: false, message: 'Product not found' }, { status: 404 })
  }

  // Create a cart item
  const cartItem = await prisma.cartItem.create({
    data: {
      name: product.name,
      plu: product.plu,
      image: product.image,
      quantity: productQuantity,
      comments: sendComments,
      price: Number(product.price) + modifiersTotal,
      product: {
        connect: {
          id: productId,
        },
      },
      activeOnOrder: true,
      order: {
        connect: {
          id: order.id,
        },
      },
      productModifiers: {
        create: modifiers.map(modifier => ({
          quantity: modifier.quantity,
          name: modifier.name,
          extraPrice: modifier.extraPrice,
          total: modifier.extraPrice * modifier.quantity,
        })),
      },
    },
  })

  // Update the order's total
  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      total: Number(order.total) + Number(cartItem.price * productQuantity),
    },
  })
  EVENTS.ISSUE_CHANGED(params.tableId)
  return json({ success: true })
}

export default function ActionsTableId() {
  const [search, setSearch] = useState('')

  const data = useLoaderData()

  const fetcher = useFetcher()
  const searchRef = React.useRef<HTMLInputElement>(null)
  // const params = useParams()
  const [productQuantity, setProductQuantity] = React.useState<number>(1)

  const [tmodifiers, setTmodifiers] = React.useState([])

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  let isSubmitting = fetcher.state !== 'idle'

  const validateForm = product => {
    const newErrors: Record<string, string> = {}
    product.modifierGroups.forEach((group: any) => {
      if (group.min > 0) {
        const groupModifiers = tmodifiers.filter((modifier: any) => modifier.modifierGroupId === group.id)
        if (groupModifiers.length < group.min) {
          newErrors.id = group.id
          newErrors.message = `Debes seleccionar al menos ${group.min} ${group.min === 1 ? 'opción' : 'opciones'}`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getModifierQuantity = modifier => {
    return tmodifiers.find(tmodifier => tmodifier.id === modifier.id)?.quantity
  }

  const getTotalModifierQuantityForGroup = modifierGroupId => {
    return tmodifiers
      .filter(tmodifier => tmodifier.modifierGroupId === modifierGroupId)
      .reduce((acc, tmodifier) => acc + tmodifier.quantity, 0)
  }
  const removeModifier = modifier => {
    setTmodifiers(tmodifiers.filter((tmodifier: any) => tmodifier.id !== modifier.id))
  }
  useEffect(() => {
    // Check if the fetcher has finished submitting and was successful
    if (fetcher.type === 'done' && fetcher.data?.success) {
      setSearch('')
      setProductQuantity(1) // Reset any other state you need to clear after form submission
      setTmodifiers([])
      setErrors({})
      // If you need to redirect or perform some action after clearing, you can do it here.
    }
  }, [fetcher])

  return (
    <div>
      {/* //  title={`Agregar productos a la mesa ${data.table.number}`} onClose={() => navigate(-2)}> */}
      <div className="h-full">
        <SearchBar placeholder="Busca productos para agregar a la orden" setSearch={setSearch} ref={searchRef} search={search} />
        {!search ? (
          <div className="p-4">
            {data.cartItems.length > 0 ? (
              <div>
                <H4 className="underline underline-offset-4">Productos ordenados en la mesa:</H4>
              </div>
            ) : (
              'No hay productos ordenados'
            )}
            {data.cartItems.map(cartItem => {
              return (
                <div key={cartItem.id} className="py-1">
                  <FlexRow className="justify-between px-2 py-1 bg-white border rounded-lg">
                    <FlexRow>
                      <div className="flex flex-row w-10 text-xs text-zinc-400 shrink">
                        {cartItem.user?.length > 0 ? cartItem.user.map(u => u.name) : 'Mesero'}
                      </div>
                      <span>{cartItem.quantity}</span>
                      <span>{cartItem.name}</span>
                    </FlexRow>
                    <FlexRow>
                      <span className="text-xs text-zinc-400">{formatCurrency('$', cartItem.price)}</span>
                      <span>{formatCurrency('$', cartItem.quantity * cartItem.price)}</span>
                    </FlexRow>
                  </FlexRow>
                </div>
              )
            })}
          </div>
        ) : null}
        <div>
          {search ? (
            <div>
              <div>
                {data.categories
                  .filter(
                    category =>
                      category.name.toLowerCase().includes(search.toLowerCase()) ||
                      category.products.some(product => product.name.toLowerCase().includes(search.toLowerCase())),
                  )
                  // .filter(category => category.name.toLowerCase().includes(search.toLowerCase()))
                  .map(category => {
                    return (
                      <div key={category.id}>
                        <H3 boldVariant="bold">{category.name}</H3>
                        <div>
                          {category.products
                            .filter(
                              product =>
                                category.name.toLowerCase().includes(search.toLowerCase()) ||
                                product.name.toLowerCase().includes(search.toLowerCase()),
                            )
                            .map(product => {
                              console.log('product', product)
                              return (
                                <div onClick={() => setSearch(product.name)} key={product.id}>
                                  <div className="flex flex-row px-4 py-2 space-x-3 bg-white border">
                                    <img
                                      alt={product.name}
                                      src={product.image ? product.image : data.branch.image}
                                      // onError={() => console.log('image error')}
                                      className="object-cover bg-white rounded-lg w-14 h-14 dark:bg-secondaryDark max-h-20 shrink-0"
                                      loading="lazy"
                                    />
                                    <div>
                                      <H5>{product.name}</H5>
                                      <H6>{formatCurrency('$', product.price)}</H6>
                                    </div>
                                  </div>
                                  {search === product.name ? (
                                    <Modal
                                      title={`Agregar productos a la mesa ${data.table.number}`}
                                      onClose={() => {
                                        setSearch('')
                                        searchRef.current?.focus()
                                        searchRef.current.value = ''
                                      }}
                                    >
                                      <div className="p-4">
                                        <H3>{product.name}</H3>
                                        <H5>{product.description}</H5>
                                        <H4 boldVariant="bold">{product.price}</H4>
                                        <FlexRow>
                                          <button
                                            className="w-10 h-10 bg-white border-2 rounded-full"
                                            onClick={() => setProductQuantity(productQuantity - 1)}
                                            disabled={productQuantity <= 1}
                                          >
                                            -
                                          </button>
                                          <span>{productQuantity}</span>

                                          <button
                                            className="w-10 h-10 bg-white border-2 rounded-full"
                                            onClick={() => setProductQuantity(productQuantity + 1)}
                                          >
                                            +
                                          </button>
                                        </FlexRow>
                                        <fetcher.Form
                                          method="POST"
                                          onSubmit={e => {
                                            if (!validateForm(product)) {
                                              e.preventDefault()
                                            }
                                          }}
                                        >
                                          <div className="space-y-2">
                                            {product.modifierGroups?.length > 0
                                              ? product.modifierGroups?.map((modifierGroup: any) => {
                                                  const isRequired = modifierGroup.min > 0
                                                  return (
                                                    <div key={modifierGroup.id}>
                                                      <FlexRow justify="between" className="py-2">
                                                        <div className="items-center justify-center block">
                                                          <H3> {modifierGroup.name}</H3>
                                                          <div>
                                                            <H6 variant="secondary">
                                                              {(modifierGroup.min === 1 && modifierGroup.max === 0) ||
                                                              (modifierGroup.min === 1 && modifierGroup.max === 1)
                                                                ? ''
                                                                : modifierGroup.min === modifierGroup.max
                                                                ? `Elige ${modifierGroup.min} `
                                                                : modifierGroup.min > 1 && modifierGroup.max > 1
                                                                ? `Elige desde ${modifierGroup.min} hasta ${modifierGroup.max} `
                                                                : modifierGroup.min > 1
                                                                ? `Elige al menos ${modifierGroup.min} `
                                                                : modifierGroup.max > 0
                                                                ? `Elige hasta ${modifierGroup.max} `
                                                                : ''}
                                                            </H6>
                                                          </div>
                                                        </div>

                                                        <div
                                                          className={clsx('px-3  border rounded-full', {
                                                            'bg-warning text-white fill-white animate-bounce z-0':
                                                              modifierGroup.id === errors.id,
                                                          })}
                                                        >
                                                          {isRequired ? <H6>Obligatorio</H6> : <H6>Opcional</H6>}
                                                        </div>
                                                      </FlexRow>

                                                      <div className="flex flex-col space-y-2">
                                                        {modifierGroup.modifiers.map((modifier: Modifiers) => {
                                                          return (
                                                            <button
                                                              type="button"
                                                              disabled={
                                                                modifierGroup.max !== 0 &&
                                                                getTotalModifierQuantityForGroup(modifierGroup.id) >= modifierGroup.max &&
                                                                !tmodifiers.flatMap((tmodifier: any) => tmodifier.id).includes(modifier.id)
                                                              }
                                                              onClick={() => {
                                                                if (
                                                                  tmodifiers.flatMap((tmodifier: any) => tmodifier.id).includes(modifier.id)
                                                                ) {
                                                                  removeModifier(modifier)
                                                                } else {
                                                                  setErrors({})
                                                                  setTmodifiers([
                                                                    ...tmodifiers,
                                                                    {
                                                                      id: modifier.id,
                                                                      quantity: 1,
                                                                      name: modifier.name,
                                                                      extraPrice: modifier.extraPrice,
                                                                      required: isRequired ? true : false,
                                                                      modifierGroupId: modifierGroup.id,
                                                                    },
                                                                  ])
                                                                }
                                                              }}
                                                              key={modifier.id}
                                                              className="flex items-center justify-between space-x-2 cursor-pointer"
                                                            >
                                                              <FlexRow>
                                                                <div
                                                                  className={clsx(
                                                                    'border-2 rounded-full h-5 w-5 flex justify-center items-center text-center p-1',
                                                                    {
                                                                      'bg-success text-white fill-white': tmodifiers
                                                                        .flatMap((tmodifier: any) => tmodifier.id)
                                                                        .includes(modifier.id),
                                                                    },
                                                                  )}
                                                                  // disabled={modifiers.includes(modifier.name) && !multiMax}
                                                                >
                                                                  {tmodifiers
                                                                    .flatMap((tmodifier: any) => tmodifier.id)
                                                                    .includes(modifier.id) && <CheckIcon className="w-3 h-3" />}
                                                                </div>
                                                                <H5>{modifier.name}</H5>
                                                                {/* ANCHOR - and + counters */}
                                                                {modifierGroup.max > 1 && modifierGroup.multiMax >= 1 && (
                                                                  <div className="flex items-center space-x-2">
                                                                    {tmodifiers
                                                                      .flatMap((tmodifier: any) => tmodifier.id)
                                                                      .includes(modifier.id) && (
                                                                      <>
                                                                        <div
                                                                          className="flex items-center justify-center w-4 h-4 border-2 rounded-sm border-day-principal "
                                                                          onClick={e => {
                                                                            e.stopPropagation()

                                                                            if (
                                                                              tmodifiers
                                                                                .flatMap(tmodifier => tmodifier.id)
                                                                                .includes(modifier.id) &&
                                                                              getModifierQuantity(modifier) > 1
                                                                            ) {
                                                                              const item = tmodifiers.map(tmodifier => {
                                                                                if (tmodifier.id === modifier.id) {
                                                                                  return { ...tmodifier, quantity: tmodifier.quantity - 1 }
                                                                                }
                                                                                return tmodifier
                                                                              })
                                                                              setTmodifiers(item)
                                                                            } else {
                                                                              setTmodifiers(
                                                                                tmodifiers.filter(
                                                                                  (tmodifier: any) => tmodifier.id !== modifier.id,
                                                                                ),
                                                                              )
                                                                            }
                                                                          }}
                                                                        >
                                                                          -
                                                                        </div>
                                                                        <span className="text-xs">
                                                                          {tmodifiers
                                                                            .flatMap(tmodifier => tmodifier.id)
                                                                            .includes(modifier.id) && getModifierQuantity(modifier)}
                                                                        </span>

                                                                        <div
                                                                          className="flex items-center justify-center w-4 h-4 border-2 rounded-sm border-day-principal"
                                                                          onClick={e => {
                                                                            e.stopPropagation()
                                                                            if (
                                                                              tmodifiers
                                                                                .flatMap(tmodifier => tmodifier.id)
                                                                                .includes(modifier.id) &&
                                                                              modifierGroup.max > getModifierQuantity(modifier) &&
                                                                              getTotalModifierQuantityForGroup(modifierGroup.id) <
                                                                                modifierGroup.max
                                                                            ) {
                                                                              const item = tmodifiers.map(tmodifier => {
                                                                                if (tmodifier.id === modifier.id) {
                                                                                  return { ...tmodifier, quantity: tmodifier.quantity + 1 }
                                                                                }
                                                                                return tmodifier
                                                                              })
                                                                              setTmodifiers(item)
                                                                            }
                                                                          }}
                                                                        >
                                                                          +
                                                                        </div>
                                                                      </>
                                                                    )}
                                                                  </div>
                                                                )}
                                                              </FlexRow>

                                                              <H6>+ {formatCurrency('$', Number(modifier.extraPrice))}</H6>
                                                            </button>
                                                          )
                                                        })}
                                                        {modifierGroup.id === errors.id ? (
                                                          <ErrorList id={errors.id} errors={[errors.message]} />
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                  )
                                                })
                                              : null}
                                          </div>
                                          {product.modifierGroups?.length > 0 ? (
                                            <>
                                              <Spacer spaceY="2" />
                                              <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px " />
                                            </>
                                          ) : null}
                                          <Spacer spaceY="2" />
                                          <SendComments />
                                          <Spacer spaceY="1" />
                                          <div className="sticky bottom-0 flex flex-col space-y-2">
                                            <Button
                                              name="_action"
                                              value="proceed"
                                              size="medium"
                                              custom="bg-success text-white fill-white"
                                              variant="custom"
                                              fullWith={true}
                                              disabled={isSubmitting}
                                              onClick={() => {
                                                searchRef.current?.focus()
                                                searchRef.current.value = ''
                                              }}
                                            >
                                              <span className="text-white">
                                                Agregar {product.name.length > 14 ? product.name.slice(0, 14) : product.name}{' '}
                                                {formatCurrency(
                                                  '$',
                                                  product.price * productQuantity +
                                                    tmodifiers.reduce((acc, tmodifier) => {
                                                      return acc + tmodifier.extraPrice * tmodifier.quantity
                                                    }, 0) *
                                                      productQuantity,
                                                )}
                                              </span>
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                searchRef.current?.focus()
                                                searchRef.current.value = ''
                                                setSearch('')
                                              }}
                                              className="w-full"
                                              variant="danger"
                                              type="button"
                                              size="medium"
                                            >
                                              Regresar
                                            </Button>
                                          </div>
                                          <input type="hidden" name="productId" value={product.id} />
                                          <input type="hidden" name="productQuantity" value={productQuantity} />
                                          <input type="hidden" name="modifiers" value={JSON.stringify(tmodifiers)} />

                                          <input type="hidden" name="errors" value={JSON.stringify(errors)} />
                                        </fetcher.Form>
                                      </div>
                                    </Modal>
                                  ) : null}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
