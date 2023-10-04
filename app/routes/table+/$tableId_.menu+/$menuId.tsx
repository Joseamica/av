import { Link, Outlet, useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/server-runtime'

import type { CartItem, Product } from '@prisma/client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { getBranch } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'

import { formatCurrency, getCurrency } from '~/utils'

import { H4, H5, H6, LinkButton, Modal, Spacer } from '~/components'

type Category = {
  id: string
  name: string
  menuId: string
  products: Product[]
  pdf?: boolean
  image?: string
}

export const handle = { backButton: true, searchButton: true, path: 'menu' }

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const session = await getSession(request)

  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const [categories, cartItems, currency] = await Promise.all([
    prisma.category.findMany({
      where: { menu: { some: { id: menuId } } },
      include: {
        products: true,
      },
    }),
    getCartItems(cart),
    getCurrency(tableId),
  ])

  return json({
    categories,
    cartItems,
    currency,
    branch,
  })
}

export default function MenuId() {
  const data = useLoaderData()
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const productCategoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
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

    Object.values(productCategoryRefs.current).forEach(div => {
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
      Object.values(productCategoryRefs.current).forEach(div => {
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
      <Modal title={`${data.branch.name} Menu `} onClose={() => navigate(`/table/${params.tableId}`)}>
        <motion.div
          id="categoryBar"
          ref={categoryBarRef}
          className={clsx(
            'no-scrollbar dark:bg-night-bg_principal sticky top-[62px] flex items-center space-x-4 overflow-x-scroll whitespace-nowrap rounded-xl bg-day-bg_principal px-5 py-6 shadow-lg overflow-y-hidden',
          )}
        >
          {data.categories.map((category: Category) => (
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
          {data.categories.map((categories: Category) => {
            const products = categories.products

            return (
              <div
                key={categories.id}
                className="p-3 bg-white rounded-lg scroll-mt-32"
                id={categories.id}
                ref={el => (productCategoryRefs.current[categories.id] = el)}
              >
                <h3>{categories.name}</h3>
                <Spacer spaceY="1" />
                <div className="flex flex-col divide-y">
                  {products.map((product: Product) => {
                    return (
                      <Link
                        key={product.id}
                        preventScrollReset
                        // to={`?productId=${product.id}`}
                        to={product.id}
                        className="flex flex-row items-center justify-between py-2 space-x-2"
                      >
                        <div className="flex flex-col ">
                          <H4 boldVariant="semibold">{product.name}</H4>
                          <H6 variant="secondary">{product.description}</H6>
                          <Spacer spaceY="1" />
                          <H5 variant="price" className="tracking-tighter">
                            {formatCurrency(data.currency, product.price)}
                          </H5>
                        </div>

                        <motion.img
                          whileHover={{ scale: 1 }}
                          whileTap={{ scale: 0.8 }}
                          src={product.image ? product.image : data.branch.image}
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
