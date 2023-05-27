import type {CartItem, MenuItem, User} from '@prisma/client'
import {json, redirect} from '@remix-run/node'
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import type {ActionArgs, LoaderArgs} from '@remix-run/server-runtime'
import React, {useRef} from 'react'
import invariant from 'tiny-invariant'
import {s} from 'vitest/dist/types-e3c9754d'
import {
  Button,
  FlexRow,
  H1,
  H2,
  H3,
  H4,
  LinkButton,
  MenuInfo,
  Modal,
  SectionContainer,
  SendComments,
} from '~/components'
import {CategoriesBar} from '~/components/'
import {prisma} from '~/db.server'
import {getBranch, getBranchId} from '~/models/branch.server'
import {getCartItems} from '~/models/cart.server'
import {getMenu} from '~/models/menu.server'
import {validateRedirect} from '~/redirect.server'
import {addToCart, getSession, sessionStorage} from '~/session.server'
import {formatCurrency, getCurrency} from '~/utils'

type MenuCategory = {
  id: string
  name: string
  menuId: string
  menuItems: MenuItem[]
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId, menuId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.menuItem.findFirst({
    where: {id: dishId},
  })

  const session = await getSession(request)

  const categories = await prisma.menuCategory.findMany({
    where: {menuId},
    include: {
      menuItems: true,
    },
  })
  //Find users on table that are not the current user,
  //this is to show users to share dishes with and you don't appear
  const usersOnTable = await prisma.user.findMany({
    where: {tableId, id: {not: session.get('userId')}},
  })

  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const cartItems = await getCartItems(cart)

  const currency = await getCurrency(tableId)

  const menu = await getMenu(branch.id)

  return json({
    categories,
    cartItems,
    usersOnTable,
    dish,
    currency,
    menu,
    branch,
  })
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const submittedItemId = formData.get('submittedItemId') as string

  const redirectTo = validateRedirect(request.redirect, ``)

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')

  if (submittedItemId) {
    addToCart(cart, submittedItemId, 1)
    session.set('cart', JSON.stringify(cart))
  }

  return redirect(redirectTo, {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}
export default function Menu() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isSticky, setIsSticky] = React.useState(false)

  const dish = searchParams.get('dishId')
  const categoryRefs = useRef<{[key: string]: any}>({})

  const navigate = useNavigate()

  const onClose = () => {
    navigate(``)
  }

  const refReachTop = useRef<HTMLDivElement>(null)
  const [currentCategory, setCurrentCategory] = React.useState<string>('')

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

  let isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form method="POST" preventScrollReset className="relative top-0">
      <MenuInfo menu={data.menu} branch={data.branch} />
      {/* CATEGORIES BAR */}
      <CategoriesBar
        categoryId={currentCategory}
        categories={data.categories}
        isSticky={isSticky}
      />
      <div className="space-y-2" ref={refReachTop}>
        {data.categories.map((categories: MenuCategory) => {
          const dishes = categories.menuItems
          return (
            <SectionContainer
              key={categories.id}
              className=" scroll-mt-[120px] rounded-xl"
              id={categories.id}
              ref={el => (categoryRefs.current[categories.id] = el)} // Aquí asignas la ref al objeto
              title={categories.name}
            >
              <div className="flex flex-col divide-y ">
                {dishes.map((dish: MenuItem) => {
                  return (
                    <Link
                      key={dish.id}
                      preventScrollReset
                      to={`?dishId=${dish.id}`}
                      className="p-2"
                    >
                      <h2>{dish.name}</h2>
                      <p>{dish.description}</p>
                      <p>{formatCurrency(data.currency, dish.price)}</p>
                      {/* FIX */}
                    </Link>
                  )
                })}
              </div>
            </SectionContainer>
          )
        })}
      </div>
      {data.cartItems?.length > 0 ? (
        <LinkButton
          to="cart"
          disabled={isSubmitting}
          className="sticky inset-x-0 bottom-0 w-full"
        >
          {isSubmitting ? 'Agregando platillos...' : 'Ir al carrito'}
          {data.cartItems
            ?.map((items: CartItem) => {
              return items.quantity
            })
            .reduce((acc: number, item: number) => {
              return acc + item
            }, 0)}
        </LinkButton>
      ) : null}
      {/* MODAL */}
      {dish && (
        <Modal
          onClose={onClose}
          title={data.dish.name}
          imgHeader={data.dish.image}
        >
          <div className="w-full space-y-2 p-4">
            <H2 boldVariant="semibold">{data.dish.name}</H2>
            <H3> {formatCurrency(data.currency, data.dish?.price)}</H3>
            <H4 variant="secondary">{data.dish.description}</H4>
          </div>
          <SendComments />
          {/* <div className=" flex  max-w-md flex-col rounded-lg ">
            <div className="px-6 py-4">
              <FlexRow justify="between" className="w-full">
                <H1 boldVariant="bold">{data.dish.name}</H1>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(data.currency, data.dish?.price)}
                </p>
              </FlexRow>
              <p className="text-base text-gray-700">{data.dish.description}</p>
            </div>
            <div className="px-6 pb-2 pt-4">
              <p className="text-lg font-semibold">Share?</p>
              {data.usersOnTable.map((user: User) => {
                return (
                  <div key={user.id} className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`shareDish-${user.id}`}
                      name="shareDish"
                      value={user.id}
                      className="h-5 w-5 rounded text-blue-600"
                    />
                    <label
                      htmlFor={`shareDish-${user.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {user.name}
                    </label>
                  </div>
                )
              })}
            </div>
          </div> */}
          <Button name="submittedItemId" value={data.dish.id} className="m-2">
            Agregar {data.dish.name}
          </Button>
        </Modal>
      )}
      {/* <input type="hidden" name="isSticky" value={isSticky ? 'isSticky' : ''} /> */}
    </fetcher.Form>
  )
}
