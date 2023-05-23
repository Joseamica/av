import type {CartItem, MenuItem, Order, User} from '@prisma/client'
import {json, redirect} from '@remix-run/node'
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import type {ActionArgs, LoaderArgs} from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import {Button, H1, H2, LinkButton, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getBranch, getBranchId} from '~/models/branch.server'
import {getCartItems} from '~/models/cart.server'
import {getOrderTotal} from '~/models/order.server'
import {validateRedirect} from '~/redirect.server'
import {addToCart, getSession, sessionStorage} from '~/session.server'

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

  return json({categories, cartItems, usersOnTable, dish})
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const submittedItemId = formData.get('submittedItemId') as string

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')

  if (submittedItemId) {
    addToCart(cart, submittedItemId, 1)
    session.set('cart', JSON.stringify(cart))
  }

  return redirect('', {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}

export default function Menu() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const [searchParams] = useSearchParams()
  const dish = searchParams.get('dishId')
  // const cart = searchParams.get('cart')
  const navigate = useNavigate()

  const onClose = () => {
    navigate(``)
  }

  let isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form method="POST" preventScrollReset>
      <div className="space-y-2 ">
        {data.categories.map((categories: MenuCategory) => {
          const dishes = categories.menuItems
          return (
            <div key={categories.id} className=" rounded-xl bg-night-200">
              <H1 className="bg-night-300">{categories.name}</H1>
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
                      <p>{dish.price?.toString()}</p>
                      {/* FIX */}
                    </Link>
                  )
                })}
              </div>
            </div>
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

      {/* <LinkButton to="?cart=true">Ir al carrito</LinkButton> */}

      {/* MODAL */}
      {dish && (
        <Modal onClose={onClose} title={data.dish.name}>
          <div>
            <div key={data.dish.id} className="p-2 ">
              <h2>{data.dish.name}</h2>
              <p>{data.dish.description}</p>
              <p>{data.dish.price?.toString()}</p>
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
