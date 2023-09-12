import { Link, Outlet, useActionData, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import React, { useRef } from 'react'
import { FaFilePdf } from 'react-icons/fa'

import { json, redirect } from '@remix-run/node'
import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import type { CartItem, MenuItem, ModifierGroup, Modifiers, User } from '@prisma/client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { addToCart, getSession, sessionStorage } from '~/session.server'

import { getBranch, getBranchId } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'

import { formatCurrency, getCurrency } from '~/utils'

import {
  Button,
  CategoriesBar,
  CheckIcon,
  FlexRow,
  H2,
  H3,
  H4,
  H5,
  H6,
  LinkButton,
  MenuInfo,
  Modal,
  QuantityButton,
  SectionContainer,
  SendComments,
  ShoppingCartIcon,
  Spacer,
  SwitchButton,
} from '~/components'

type MenuCategory = {
  id: string
  name: string
  menuId: string
  menuItems: MenuItem[]
  pdf?: boolean
  image?: string
}

interface ModifierGroups extends ModifierGroup {
  modifiers: Modifiers[]
}

export const handle = { backButton: true, searchButton: true }

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.menuItem.findFirst({
    where: { id: dishId },
  })

  const session = await getSession(request)

  const categories = await prisma.menuCategory.findMany({
    where: { menu: { some: { id: menuId } } },
    include: {
      menuItems: true,
    },
  })

  const modifierGroup = await prisma.modifierGroup.findMany({
    where: { menuItems: { some: { id: dishId } } },
    include: { modifiers: true },
  })
  //Find users on table that are not the current user,
  //this is to show users to share dishes with and you don't appear
  const usersOnTable = await prisma.user.findMany({
    where: { tableId, id: { not: session.get('userId') } },
  })

  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const cartItems = await getCartItems(cart)

  const currency = await getCurrency(tableId)

  const menu = await getMenu(branch.id)

  return json({
    categories,
    modifierGroup,
    cartItems,
    usersOnTable,
    dish,
    currency,
    menu,
    branch,
  })
}

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const _action = formData.get('_action') === 'proceed'
  const submittedItemId = formData.get('submittedItemId') as string
  const modifiers = formData.getAll('modifier') as string[]

  const redirectTo = validateRedirect(request.redirect, ``)
  const shareDish = formData.getAll('shareDish')
  const quantity = Number(formData.get('quantity') as string)

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')

  if (_action && submittedItemId) {
    addToCart(cart, submittedItemId, quantity, modifiers)
    session.set('cart', JSON.stringify(cart))
    session.set('shareUserIds', JSON.stringify(shareDish))
    return redirect(redirectTo, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  }

  return json({ modifiers })
}

export default function Menu() {
  const data = useLoaderData()
  console.log('data', data)

  const fetcher = useFetcher()

  const [searchParams, setSearchParams] = useSearchParams()
  const [isSticky, setIsSticky] = React.useState(false)

  const dish = searchParams.get('dishId')
  const categoryRefs = useRef<{ [key: string]: any }>({})

  // const navigate = useNavigate()

  const onClose = () => {
    searchParams.delete('dishId')
    setSearchParams(searchParams)
  }

  const refReachTop = useRef<HTMLDivElement>(null)
  const [currentCategory, setCurrentCategory] = React.useState<string>(data.categories[0].id)
  const [quantity, setQuantity] = React.useState<number>(1)
  const [seePdf, setSeePdf] = React.useState<boolean>(false)

  const handleScroll = () => {
    const categoryIds = Object.keys(categoryRefs.current)
    if (refReachTop.current) {
      setIsSticky(refReachTop.current.getBoundingClientRect().top <= 0)
    }
    for (const id of categoryIds) {
      const ref = categoryRefs.current[id]
      if (ref) {
        const rect = ref.getBoundingClientRect()
        if (rect.top >= 0) {
          setCurrentCategory(id)
          break
        }
      }
    }
  }
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isDishNull = dish === null

  //NOTE - This is to reset the quantity when the modal closes
  React.useEffect(() => {
    setQuantity(1)
  }, [isDishNull])

  // const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    fetcher.submit(event.currentTarget, { replace: true })
  }

  let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'

  const cartItemsAdded = data.cartItems
    ?.map((items: CartItem) => {
      return items.quantity
    })
    .reduce((acc: number, item: number) => {
      return acc + item
    }, 0)

  return (
    <div className="no-scrollbar">
      <Spacer spaceY="2" />
      <MenuInfo menu={data.menu} branch={data.branch} />
      <Spacer spaceY="2" />
      {/* NOTE: if there is a category.pdf === true then show */}
      {data.categories.filter(category => category.pdf) && (
        <SwitchButton
          setToggle={() => setSeePdf(!seePdf)}
          state={seePdf}
          leftText="Ordenar"
          rightText="Ver PDF"
          leftIcon={<ShoppingCartIcon />}
          rightIcon={<FaFilePdf />}
          height="medium"
          stretch
          allCornersRounded={true}
        />
      )}

      <Spacer spaceY="2" />
      {seePdf ? (
        <div className="space-y-2">
          {data.categories
            .filter((category: MenuCategory) => category.pdf)
            .map((category: MenuCategory) => (
              <div key={category.id}>
                <div className="overflow-hidden">
                  <img alt="" className="object-cover transform rounded-xl " src={category.image} />
                </div>
              </div>
            ))}
          <Outlet />
        </div>
      ) : (
        <>
          <fetcher.Form method="POST" preventScrollReset className="relative top-0" onChange={handleChange}>
            {/* CATEGORIES BAR */}
            <CategoriesBar
              categoryId={currentCategory}
              categories={
                !seePdf
                  ? data.categories.filter((category: MenuCategory) => !category.pdf)
                  : data.categories.filter(category => category.pdf)
              }
              isSticky={isSticky}
            />
            <Spacer spaceY="2" />
            <div className="space-y-2" ref={refReachTop}>
              {data.categories
                .filter((category: MenuCategory) => !category.pdf)
                .map((categories: MenuCategory) => {
                  const dishes = categories.menuItems
                  return (
                    <div
                      key={categories.id}
                      className="p-3 bg-white border rounded-lg scroll-mt-32 "
                      id={categories.id}
                      ref={el => (categoryRefs.current[categories.id] = el)} // Aquí asignas la ref al objeto
                    >
                      <H3 boldVariant="semibold" className="">
                        {categories.name}
                      </H3>
                      <Spacer spaceY="1" />
                      <div className="flex flex-col divide-y">
                        {dishes.map((dish: MenuItem) => {
                          return (
                            <Link
                              key={dish.id}
                              preventScrollReset
                              to={`?dishId=${dish.id}`}
                              className="flex flex-row items-center justify-between py-2 space-x-2"
                            >
                              <div className="flex flex-col ">
                                <H4 boldVariant="semibold">{dish.name}</H4>
                                <H6 variant="secondary">{dish.description}</H6>
                                <Spacer spaceY="1" />
                                <H5 variant="price" className="tracking-tighter">
                                  {formatCurrency(data.currency, dish.price)}
                                </H5>
                              </div>

                              <motion.img
                                whileHover={{ scale: 1 }}
                                whileTap={{ scale: 0.8 }}
                                src={dish.image ? dish.image : data.branch.image}
                                // onError={() => console.log('image error')}
                                className="object-cover w-24 bg-white rounded-lg dark:bg-secondaryDark h-28 max-h-24 shrink-0"
                                loading="lazy"
                                width="112"
                                height="112"
                              />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
            {data.cartItems?.length > 0 ? (
              <LinkButton to="cart" disabled={isSubmitting} className="sticky inset-x-0 w-full mb-2 bottom-4">
                {isSubmitting ? `Agregando platillos... (${cartItemsAdded})` : `Ir al carrito (${cartItemsAdded})`}
              </LinkButton>
            ) : null}
            {/* MODAL */}
            {dish && (
              <Modal onClose={onClose} title={data.dish.name} imgHeader={data.dish.image}>
                <div className="w-full p-4 space-y-2 overflow-auto">
                  <H2 boldVariant="semibold">{data.dish.name}</H2>
                  <H3> {formatCurrency(data.currency, data.dish?.price)}</H3>
                  <H4 variant="secondary">{data.dish.description}</H4>
                  {data.usersOnTable.length > 0 && <H4>¿Quieres compartir?</H4>}
                  {data.usersOnTable.map((user: User) => {
                    return (
                      <div key={user.id} className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id={`shareDish-${user.id}`}
                          name="shareDish"
                          value={user.id}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <label htmlFor={`shareDish-${user.id}`} className="ml-2 text-sm text-gray-700">
                          {user.name}
                        </label>
                      </div>
                    )
                  })}
                  <Spacer spaceY="1" />
                  <QuantityButton
                    onDecrease={() => setQuantity(quantity - 1)}
                    onIncrease={() => setQuantity(quantity + 1)}
                    quantity={quantity}
                    disabled={quantity <= 1}
                  />
                  <div className="space-y-4">
                    {data.modifierGroup.map((modifierGroup: ModifierGroups) => {
                      return (
                        <div key={modifierGroup.id} className="space-y-2">
                          <Spacer spaceY="1" />
                          <FlexRow>
                            <H2 variant="secondary">{modifierGroup.name}</H2>
                            <span className="px-2 text-white rounded-full bg-button-primary ">
                              {modifierGroup?.isMandatory ? 'Requerido' : 'Opcional'}
                            </span>
                          </FlexRow>
                          <div className="flex flex-col space-y-2">
                            {modifierGroup.modifiers.map((modifier: Modifiers) => {
                              const isChecked = fetcher.data?.modifiers.find((id: Modifiers['id']) => id === modifier.id)
                              // console.log('isChecked', isChecked)
                              return (
                                <label htmlFor={modifier.id} className="flex flex-row space-x-2" key={modifier.id}>
                                  <span
                                    className={clsx('h-6 w-6 rounded-full ring-2 ring-button-primary', {
                                      'flex items-center justify-center bg-button-primary text-white ': isChecked,
                                    })}
                                  >
                                    {isChecked ? <CheckIcon /> : ''}
                                  </span>
                                  <input
                                    id={modifier.id}
                                    type={modifierGroup.type}
                                    name="modifier"
                                    value={modifier.id}
                                    required={modifierGroup.isMandatory ? true : false}
                                    className="sr-only"
                                    defaultChecked={modifierGroup.type === 'radio' ? isChecked : undefined}
                                  />
                                  <H3>{modifier.name}</H3>
                                  <H3>{formatCurrency(data.currency, Number(modifier.extraPrice))}</H3>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <SendComments />
                </div>

                <Button name="_action" value="proceed" className="m-2" disabled={isSubmitting}>
                  Agregar {data.dish.name}
                </Button>
                <input type="hidden" name="submittedItemId" value={data.dish.id} />
                <input type="hidden" name="quantity" value={quantity} />
              </Modal>
            )}
          </fetcher.Form>
          <Outlet />
        </>
      )}
    </div>
  )
}