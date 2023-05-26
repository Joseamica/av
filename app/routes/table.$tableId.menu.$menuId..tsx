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
import {
  Button,
  H1,
  LinkButton,
  MenuInfo,
  Modal,
  SectionContainer,
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
  const [searchParams] = useSearchParams()
  const [isSticky, setIsSticky] = React.useState(false)

  const dish = searchParams.get('dishId')
  const categoryRefs = useRef<{[key: string]: any}>({})

  const navigate = useNavigate()

  const onClose = () => {
    navigate(``)
  }

  const refReachTop = useRef<HTMLDivElement>(null)
  const [currentCategory, setCurrentCategory] = React.useState({})

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
            >
              <H1>{categories.name}</H1>
              <div className="flex flex-col divide-y-2 ">
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
        <Modal onClose={onClose} title={data.dish.name}>
          <div>
            <div key={data.dish.id} className="p-2 ">
              <h2>{data.dish.name}</h2>
              <p>{data.dish.description}</p>
              <p>{formatCurrency(data.currency, data.dish?.price)}</p>
              <div>
                <p>share?</p>
                {data.usersOnTable.map((user: User) => {
                  return (
                    <div key={user.id}>
                      <input
                        type="checkbox"
                        name="shareDish"
                        value={user.id}
                        className="h-7 w-7"
                      />
                      <label htmlFor="share">{user.name}</label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <Button name="submittedItemId" value={data.dish.id}>
            Agregar {data.dish.name}
          </Button>
        </Modal>
      )}
    </fetcher.Form>
  )
}
