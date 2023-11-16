import { CheckCircledIcon } from '@radix-ui/react-icons'
import * as Separator from '@radix-ui/react-separator'
import { useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import React from 'react'
import { FaCheck, FaExclamationCircle } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { type CartItem, type Modifiers } from '@prisma/client'
import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { addToCart, getSession, sessionStorage } from '~/session.server'

import { getBranch } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'

import { formatCurrency, getCurrency } from '~/utils'

import { Button, CheckIcon, FlexRow, H2, H3, H4, H5, H6, Modal, QuantityButton, SendComments, Spacer } from '~/components'
import { ErrorList } from '~/components/forms'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId, productId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const session = await getSession(request)
  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const [categories, modifierGroup, usersOnTable, cartItems, currency, menu, product] = await Promise.all([
    prisma.category.findMany({
      where: { menu: { some: { id: menuId } } },
      include: {
        products: true,
      },
    }),
    prisma.modifierGroup.findMany({
      where: { products: { some: { id: productId } }, available: true },
      include: { modifiers: { where: { available: true } } },
    }),
    prisma.user.findMany({
      where: { tableId, id: { not: session.get('userId') } },
    }),
    getCartItems(cart),
    getCurrency(tableId),
    getMenu(branch.id),
    prisma.product.findUnique({
      where: { id: productId },
    }),
  ])

  return json({
    categories,
    modifierGroup,
    cartItems,
    usersOnTable,
    product,
    currency,
    menu,
    branch,
  })
}
export async function action({ request, params }: ActionArgs) {
  const { tableId, productId } = params
  const formData = await request.formData()
  const productQuantity = Number(formData.get('productQuantity'))
  const modifiers = JSON.parse(formData.get('modifiers') as string)
  const sendComments = formData.get('sendComments') as string
  console.log('sendComments', sendComments)
  const session = await getSession(request)
  const cart = JSON.parse(session.get('cart') || '[]')
  addToCart(cart, productId, productQuantity, modifiers, sendComments)
  session.set('cart', JSON.stringify(cart))

  return redirect(`/table/${tableId}/menu/${params.menuId}`, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}

export default function ProductId() {
  const data = useLoaderData()

  const fetcher = useFetcher()
  const navigate = useNavigate()
  const params = useParams()
  // const params = useParams()
  const [productQuantity, setProductQuantity] = React.useState<number>(1)

  const [tmodifiers, setTmodifiers] = React.useState([])

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  let isSubmitting = fetcher.state !== 'idle'

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    data.modifierGroup.forEach((group: any) => {
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

  return (
    <Modal
      onClose={() => navigate(`/table/${params.tableId}/menu/${params.menuId}`)}
      title={data.product?.name}
      imgHeader={data.product?.image}
      // fullScreen={true}
    >
      <div className="w-full   bg-white">
        <div className="space-y-1  px-4 pt-4">
          <H2 boldVariant="bold">{data.product.name}</H2>
          <H4 boldVariant="semibold"> {formatCurrency(data.currency, data.product?.price)}</H4>
          <H5 variant="secondary">{data.product.description}</H5>
        </div>
        {data.modifierGroup.length > 0 ? (
          <>
            <Spacer spaceY="2" />
            <div className="w-full h-2 bg-bgDivider" />
          </>
        ) : null}

        <fetcher.Form
          method="POST"
          onSubmit={e => {
            if (!validateForm()) {
              e.preventDefault()
            }
          }}
        >
          <div className="space-y-2  divide-y-8 divide-bgDivider">
            {data.modifierGroup.length > 0
              ? data.modifierGroup?.map((modifierGroup: any) => {
                  const isRequired = modifierGroup.min > 0
                  const isRequiredAndSelected = isRequired && getTotalModifierQuantityForGroup(modifierGroup.id) > 0
                  return (
                    <div key={modifierGroup.id}>
                      <FlexRow justify="between" className="py-2 px-4 pt-2">
                        <div className="block justify-center items-center">
                          <H3 boldVariant="semibold"> {modifierGroup.name}</H3>
                          <div className="pb-1">
                            <H6 variant="secondary">
                              {(modifierGroup.min === 1 && modifierGroup.max === 0) || (modifierGroup.min === 1 && modifierGroup.max === 1)
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
                            'bg-bgError text-error animate-bounce z-0': modifierGroup.id === errors.id,
                            'bg-bgApproved text-approved': isRequiredAndSelected,
                          })}
                        >
                          {isRequired ? (
                            <FlexRow>
                              {isRequiredAndSelected ? <FaCheck className="h-4 w-4" /> : null}
                              {modifierGroup.id === errors.id ? <FaExclamationCircle /> : null}
                              <H5>Obligatorio</H5>
                            </FlexRow>
                          ) : (
                            <H5>Opcional</H5>
                          )}
                        </div>
                      </FlexRow>

                      <div className="flex flex-col  px-4 pb-2 space-y-2">
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
                                if (tmodifiers.flatMap((tmodifier: any) => tmodifier.id).includes(modifier.id)) {
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
                              className="flex items-center space-x-2 justify-between cursor-pointer"
                            >
                              <FlexRow>
                                <div
                                  className={clsx('border-2 rounded-full h-5 w-5 flex justify-center items-center text-center p-1', {
                                    'bg-success text-white fill-white': tmodifiers
                                      .flatMap((tmodifier: any) => tmodifier.id)
                                      .includes(modifier.id),
                                  })}
                                  // disabled={modifiers.includes(modifier.name) && !multiMax}
                                >
                                  {tmodifiers.flatMap((tmodifier: any) => tmodifier.id).includes(modifier.id) && (
                                    <CheckIcon className="h-3 w-3" />
                                  )}
                                </div>
                                <H5>{modifier.name}</H5>
                                {/* ANCHOR - and + counters */}
                                {modifierGroup.max > 1 && modifierGroup.multiMax >= 1 && (
                                  <div className="flex space-x-2 items-center">
                                    {tmodifiers.flatMap((tmodifier: any) => tmodifier.id).includes(modifier.id) && (
                                      <>
                                        <div
                                          className="border-2 h-4 w-4 flex justify-center items-center border-day-principal rounded-sm             "
                                          onClick={e => {
                                            e.stopPropagation()

                                            if (
                                              tmodifiers.flatMap(tmodifier => tmodifier.id).includes(modifier.id) &&
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
                                              setTmodifiers(tmodifiers.filter((tmodifier: any) => tmodifier.id !== modifier.id))
                                            }
                                          }}
                                        >
                                          -
                                        </div>
                                        <span className="text-xs">
                                          {tmodifiers.flatMap(tmodifier => tmodifier.id).includes(modifier.id) &&
                                            getModifierQuantity(modifier)}
                                        </span>

                                        <div
                                          className="border-2 h-4 w-4 flex justify-center items-center border-day-principal rounded-sm"
                                          onClick={e => {
                                            e.stopPropagation()
                                            if (
                                              tmodifiers.flatMap(tmodifier => tmodifier.id).includes(modifier.id) &&
                                              modifierGroup.max > getModifierQuantity(modifier) &&
                                              getTotalModifierQuantityForGroup(modifierGroup.id) < modifierGroup.max
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

                              <H6>+ {formatCurrency(data.currency, Number(modifier.extraPrice))}</H6>
                            </button>
                          )
                        })}
                        {modifierGroup.id === errors.id ? <ErrorList id={errors.id} errors={[errors.message]} /> : null}
                      </div>
                    </div>
                  )
                })
              : null}
          </div>
          {data.modifierGroup.length > 0 ? (
            <>
              <Spacer spaceY="2" />
              <div className="w-full h-2 bg-bgDivider" />
            </>
          ) : null}
          <div className="px-4">
            <Spacer spaceY="2" />
            <H3 boldVariant="semibold">Instrucciones especiales</H3>
            <Spacer spaceY="1" />
            <SendComments />
            <Spacer spaceY="1" />
            <QuantityButton
              onDecrease={() => setProductQuantity(productQuantity - 1)}
              onIncrease={() => setProductQuantity(productQuantity + 1)}
              quantity={productQuantity}
              disabled={productQuantity <= 1}
            />
            <Spacer spaceY="3" />
          </div>
          <div className="sticky bottom-0 bg-white py-4 px-4">
            <Button
              name="_action"
              value="proceed"
              size="medium"
              variant={errors?.message ? 'custom' : 'primary'}
              fullWith={true}
              disabled={isSubmitting}
              className={clsx('', {
                'text-error  border-4  rounded-full bg-white text-sm': errors?.message,
              })}
            >
              {errors?.message ? (
                errors?.message
              ) : (
                <>
                  Agrega {productQuantity} al carrito •{' '}
                  {formatCurrency(
                    data.currency,
                    data.product.price * productQuantity +
                      tmodifiers.reduce((acc, tmodifier) => {
                        return acc + tmodifier.extraPrice * tmodifier.quantity
                      }, 0) *
                        productQuantity,
                  )}
                </>
              )}
            </Button>
          </div>
          {/* <Spacer spaceY="2" /> */}

          <input type="hidden" name="productId" value={data.product.id} />
          <input type="hidden" name="productQuantity" value={productQuantity} />
          <input type="hidden" name="modifiers" value={JSON.stringify(tmodifiers)} />

          <input type="hidden" name="errors" value={JSON.stringify(errors)} />
        </fetcher.Form>
      </div>
    </Modal>
  )
}
