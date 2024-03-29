import { Link, useActionData, useLoaderData, useNavigate, useSearchParams } from '@remix-run/react'
import React from 'react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { CartItem, ModifierGroup, Modifiers, Product, User } from '@prisma/client'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { addToCart, getSession } from '~/session.server'

import { getBranch, getBranchId } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'

import { formatCurrency, getCurrency } from '~/utils'

import {
  Button,
  CheckIcon,
  ChevronLeftIcon,
  FlexRow,
  H2,
  H3,
  H4,
  H5,
  Modal,
  SectionContainer,
  SendComments,
  Spacer,
  XIcon,
} from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.product.findFirst({
    where: { id: dishId },
  })

  const session = await getSession(request)

  const categories = await prisma.category.findMany({
    where: { menu: { some: { id: menuId } } },
    include: {
      products: true,
    },
  })

  const modifierGroup = await prisma.modifierGroup.findMany({
    where: { products: { some: { id: dishId } } },
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

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')

  if (_action && submittedItemId) {
    addToCart(cart, submittedItemId, 1, modifiers)
    session.set('cart', JSON.stringify(cart))
    session.set('shareUserIds', JSON.stringify(shareDish))
    return redirect(redirectTo, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  }

  return json({ modifiers })
}

interface ModifierGroups extends ModifierGroup {
  modifiers: Modifiers[]
}
export default function Search() {
  const data = useLoaderData()
  const actionData = useActionData()
  const navigate = useNavigate()

  const [searchText, setSearchText] = React.useState('')

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault()
    setSearchText(event.target.value.toLowerCase())
    // submit(event.currentTarget, {replace: true})
  }

  // let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'
  // const submitButton = isSubmitting ? 'Enviando...' : 'Enviar reporte'

  const onClose = () => {
    navigate('..')
  }
  const onCloseDish = () => {
    searchParams.delete('dishId')
    setSearchParams(searchParams)
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const dish = searchParams.get('dishId')

  return (
    <>
      <Modal
        title="Buscar platillos"
        onClose={onClose}
        // fullScreen={true}
        justify="start"
        // onSubmit={handleSubmit}
        // onChange={handleChange}
      >
        <label htmlFor="search" className="sticky top-0 z-50 flex flex-row w-full p-2 bg-white dark:bg-mainDark focus:border focus:ring-1 ">
          <button className="flex items-center justify-center p-3 rounded-l-full bg-gray_light dark:bg-gray_light " onClick={onClose}>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <motion.input
            id="search"
            type="text"
            initial="hidden"
            name="search"
            autoFocus={true}
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
            placeholder="Buscar platillo"
            className="flex w-full p-3 px-3 py-3 text-sm rounded-r-full bg-gray_light focus:border-none focus:outline-none focus:ring-0 dark:bg-gray_light"
            style={{ fontSize: '16px' }}
          />
          {searchText && (
            <button className="p-2" onClick={() => setSearchText('')}>
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </label>
        <div className="flex flex-col p-2 space-y-2">
          {data.categories.map((categories: any) => {
            const filteredItems = categories.products.filter((product: Product) =>
              searchText === '' ? null : product.name.toLowerCase().includes(searchText),
            )
            return (
              <div key={categories.id}>
                {filteredItems.length > 0 ? (
                  <SectionContainer key={categories.id} divider={true}>
                    <H3 className="sticky w-full p-4 bg-white shadow-md top-12 dark:shadow-none ">{categories.name}</H3>
                    {/* //~~>All menu items<~~// */}
                    <AnimatePresence initial={false}>
                      <div className="">
                        {filteredItems &&
                          filteredItems.map((product: Product) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-2 space-y-1 overflow-hidden bg-white dark:bg-transparent"
                            >
                              <Link key={product.id} preventScrollReset to={`?dishId=${product.id}`} className="p-2">
                                <FlexRow justify="between">
                                  <div className="flex flex-col ">
                                    <H3>{product.name}</H3>
                                    <H5>{product.description}</H5>
                                    <Spacer spaceY="1" />
                                    <H3>{formatCurrency(data.currency, product.price)}</H3>
                                  </div>
                                  <motion.img
                                    whileHover={{ scale: 1 }}
                                    whileTap={{ scale: 0.8 }}
                                    src={product.image ? product.image : ''}
                                    // onError={() => console.log('image error')}
                                    className="object-cover w-24 bg-white rounded-lg dark:bg-secondaryDark max-h-24 shrink-0"
                                    loading="lazy"
                                  />
                                </FlexRow>
                                {/* FIX */}
                              </Link>
                            </motion.div>
                          ))}
                      </div>
                    </AnimatePresence>
                  </SectionContainer>
                ) : (
                  <div className="h-full "></div>
                )}
              </div>
            )
          })}
        </div>
      </Modal>
      {dish && (
        <Modal
          onClose={onCloseDish}
          title={data.dish.name}
          imgHeader={data.dish.image}
          // fullScreen={true}
        >
          <div className="w-full p-4 space-y-2 overflow-auto">
            <H2 boldVariant="semibold">{data.dish.name}</H2>
            <H3> {formatCurrency(data.currency, data.dish?.price)}</H3>
            <H4 variant="secondary">{data.dish.description}</H4>
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
                        const isChecked = actionData?.modifiers.find((id: Modifiers['id']) => id === modifier.id)
                        return (
                          <label htmlFor={modifier.id} className="flex flex-row space-x-2" key={modifier.id}>
                            <span
                              className={clsx('h-6 w-6 rounded-full ring-2', {
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
          {/* <Button name="submittedItemId" value={data.dish.id} className="m-2">
          Agregar {data.dish.name}
        </Button> */}
          <Button name="_action" value="proceed" className="m-2">
            Agregar {data.dish.name}
          </Button>
          <input type="hidden" name="submittedItemId" value={data.dish.id} />
        </Modal>
      )}
    </>
  )
}
