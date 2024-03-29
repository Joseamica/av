import * as Switch from '@radix-ui/react-switch'
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

import { H2, H3, H4, H5, H6, LinkButton, Modal, ShoppingCartIcon, Spacer } from '~/components'

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

  const [categories, cartItems, currency, menu] = await Promise.all([
    prisma.category.findMany({
      where: { menu: { some: { id: menuId } } },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        products: {
          where: {
            available: true,
          },
        },
      },
    }),
    getCartItems(cart),
    getCurrency(tableId),
    prisma.menu.findUnique({
      where: {
        id: menuId,
      },
    }),
  ])

  return json({
    categories,
    cartItems,
    currency,
    branch,
    menu,
  })
}

export default function MenuId() {
  const data = useLoaderData()
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const productCategoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const [showMenuPdf, setShowMenuPdf] = useState(false)
  const categoryRefs = useRef<{ [key: string]: any }>({})
  const categoryBarRef = useRef(null)

  const fetcher = useFetcher()
  const navigate = useNavigate()
  const params = useParams()
  let isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading'

  useEffect(() => {
    // Intersection Observer logic
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveCategoryId(entry.target.getAttribute('id'))
          }
        })
      },
      {
        root: null,
        threshold: 0.5,
        rootMargin: '0px 0px -50% 0px',
      },
    )

    Object.values(productCategoryRefs.current).forEach(div => {
      if (div) observer.observe(div)
    })

    return () => {
      Object.values(productCategoryRefs.current).forEach(div => {
        if (div) observer.unobserve(div)
      })
    }
  }, [])

  useEffect(() => {
    // Horizontal scrolling logic
    const activeCategoryElement = categoryRefs.current[activeCategoryId]
    const categoryBarElement = categoryBarRef.current

    if (activeCategoryElement && categoryBarElement) {
      const scrollLeftPosition =
        activeCategoryElement.offsetLeft - categoryBarElement.clientWidth / 2 + activeCategoryElement.clientWidth / 2
      categoryBarElement.scrollLeft = scrollLeftPosition
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
      <Modal
        title={`${data.branch.name} Menu `}
        onClose={() => navigate(`/table/${params.tableId}`, { preventScrollReset: true })}
        showCart={
          data.cartItems?.length > 0 && (
            <Link
              to={`/table/${params.tableId}/menu/${params.menuId}/cart`}
              className="flex space-x-2 border rounded-xl px-2 py-1"
              preventScrollReset
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="text-sm">{cartItemsAdded}</span>
            </Link>
          )
        }
      >
        <motion.div
          id="categoryBar"
          ref={categoryBarRef}
          className={clsx(
            'no-scrollbar dark:bg-night-bg_principal sticky top-[62px] flex items-center space-x-4 overflow-x-scroll whitespace-nowrap rounded-xl bg-day-bg_principal px-5 py-6 shadow-lg overflow-y-hidden z-10',
          )}
        >
          {data.categories.map((category: Category) => (
            <Link
              ref={el => (categoryRefs.current[category.id] = el)}
              to={`#${category.id}`}
              key={category.id}
              preventScrollReset
              className={clsx('text-xs', {
                'underline text-small font-medium text-day-principal underline-offset-4 decoration-day-principal':
                  category.id === activeCategoryId,
              })}
            >
              <span className={clsx({ 'text-sm font-semibold': category.id === activeCategoryId })}>{category.name}</span>
            </Link>
          ))}
        </motion.div>
        {data.menu.pdfImage.length > 0 ? (
          <div className="flex w-full justify-end py-3 px-4">
            <div className="flex items-center">
              <label className=" text-[15px] leading-none pr-[15px]" htmlFor="airplane-mode">
                Ver menu en pdf
              </label>
              <Switch.Root
                className="w-[42px] h-[25px] bg-blackA6 rounded-full relative shadow-[0_2px_10px] shadow-blackA4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default"
                id="pdf"
                onClick={() => setShowMenuPdf(!showMenuPdf)}
                checked={showMenuPdf}
              >
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
              </Switch.Root>
            </div>
          </div>
        ) : null}
        {showMenuPdf && data.menu.pdfImage.length > 0 ? (
          <div className="space-y-1 p-2 flex-grow">
            {data.menu.pdfImage.map((pdf, index) => {
              return (
                <img
                  key={index}
                  alt={'img'}
                  src={pdf}
                  className="object-cover w-full bg-white rounded-lg dark:bg-secondaryDark shrink-0 relative block overflow-clip"
                  loading="lazy"
                />
              )
            })}
          </div>
        ) : (
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
                  <H2 boldVariant="bold">{categories.name}</H2>
                  <Spacer spaceY="1" />
                  <div className="flex flex-col divide-y">
                    {products.map((product: Product) => {
                      return (
                        <Link
                          key={product.id}
                          preventScrollReset={true}
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
                          <div className="relative w-24 shrink-0">
                            <motion.img
                              whileHover={{ scale: 1 }}
                              whileTap={{ scale: 0.8 }}
                              src={product.image ? product.image : data.branch.image}
                              // onError={() => console.log('image error')}
                              className="object-cover w-24 bg-white rounded-lg dark:bg-secondaryDark h-28 max-h-24 shrink-0 relative"
                              loading="lazy"
                              width="112"
                              height="112"
                            />
                            <p className="text-black flex justify-center items-center rounded-full absolute bottom-1 right-1 h-7 w-7 font-bold bg-white">
                              +
                            </p>
                          </div>
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
                {isSubmitting ? (
                  `Agregando platillos... (${cartItemsAdded})`
                ) : (
                  <div className="flex space-x-2 items-center">
                    <ShoppingCartIcon className="fill-white h-5 w-5" />
                    <span> Ir al carrito {cartItemsAdded}</span>
                  </div>
                )}
              </LinkButton>
            ) : null}
          </div>
        )}
      </Modal>
      <Outlet />
    </>
  )
}
