import { Link, Outlet, useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/server-runtime'

import type { CartItem, MenuItem, ModifierGroup, Modifiers } from '@prisma/client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { getBranch } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'

import { formatCurrency, getCurrency } from '~/utils'

import { H4, H5, H6, LinkButton, Modal, Spacer } from '~/components'

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

export const handle = { backButton: true, searchButton: true, path: 'menu' }

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

export default function MenuId() {
  const data = useLoaderData()
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const dishCategoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const categoryRefs = useRef<{ [key: string]: any }>({})
  const categoryBarRef = useRef(null)

  const fetcher = useFetcher()
  const navigate = useNavigate()
  const params = useParams()
  let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'

  useEffect(() => {
    let intersectingIds = []

    // Existing vertical scrolling logic
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('id')
          if (entry.isIntersecting) {
            intersectingIds.push(id)
          } else {
            intersectingIds = intersectingIds.filter(intersectingId => intersectingId !== id)
          }
        })

        if (intersectingIds.length) {
          setActiveCategoryId(intersectingIds[intersectingIds.length - 1])
        }
      },
      {
        root: document.querySelector('.categoryBar'),
        rootMargin: '0px 0px -90% 0px',
        threshold: 0.1,
      },
    )

    Object.values(dishCategoryRefs.current).forEach(div => {
      if (div) {
        observer.observe(div)
      }
    })

    // Added horizontal scrolling logic
    const activeCategoryElement = categoryRefs.current[activeCategoryId]
    if (activeCategoryElement) {
      const categoryBarElement = categoryBarRef.current
      if (categoryBarElement) {
        categoryBarElement.scrollLeft =
          activeCategoryElement.offsetLeft - categoryBarElement.clientWidth / 2 + activeCategoryElement.clientWidth / 2
      }
    }

    return () => {
      Object.values(dishCategoryRefs.current).forEach(div => {
        if (div) {
          observer.unobserve(div)
        }
      })
    }
  }, [activeCategoryId])

  const cartItemsAdded = data.cartItems
    ?.map((items: CartItem) => {
      return items.quantity
    })
    .reduce((acc: number, item: number) => {
      return acc + item
    }, 0)

  return (
    <>
      <Modal title={`${data.branch.name} Menu`} onClose={() => navigate(`/table/${params.tableId}`)}>
        <motion.div
          id="categoryBar"
          ref={categoryBarRef}
          className={clsx(
            'no-scrollbar dark:bg-night-bg_principal sticky top-[62px] flex items-center space-x-4 overflow-x-scroll whitespace-nowrap rounded-xl bg-day-bg_principal px-5 py-6 shadow-lg overflow-y-hidden',
          )}
        >
          {data.categories.map((category: MenuCategory) => (
            <Link
              ref={el => (categoryRefs.current[category.id] = el)}
              to={`#${category.id}`}
              key={category.id}
              className={clsx('text-xs', {
                'underline text-small font-medium text-day-principal underline-offset-4 decoration-day-principal':
                  category.id === activeCategoryId,
              })}
            >
              <span className={clsx({ 'text-sm font-semibold': category.id === activeCategoryId })}>{category.name}</span>
            </Link>
          ))}
        </motion.div>
        <div className="p-2 space-y-2">
          {data.categories.map((categories: MenuCategory) => {
            const dishes = categories.menuItems

            return (
              <div
                key={categories.id}
                className="p-3 bg-white rounded-lg scroll-mt-32"
                id={categories.id}
                ref={el => (dishCategoryRefs.current[categories.id] = el)}
              >
                <h3>{categories.name}</h3>
                <Spacer spaceY="1" />
                <div className="flex flex-col divide-y">
                  {dishes.map((dish: MenuItem) => {
                    return (
                      <Link
                        key={dish.id}
                        preventScrollReset
                        // to={`?dishId=${dish.id}`}
                        to={dish.id}
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
          {data.cartItems?.length > 0 ? (
            <LinkButton
              to={`/table/${params.tableId}/menu/${params.menuId}/cart`}
              disabled={isSubmitting}
              className="sticky inset-x-0 w-full mb-2 bottom-4"
            >
              {isSubmitting ? `Agregando platillos... (${cartItemsAdded})` : `Ir al carrito (${cartItemsAdded})`}
            </LinkButton>
          ) : null}
        </div>
      </Modal>
      <Outlet />
    </>
  )
}
