import {ChevronDoubleUpIcon} from '@heroicons/react/outline'
import type {CartItem} from '@prisma/client'
import type {ActionArgs, DataFunctionArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  Link,
  NavLink,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react'
import {useState} from 'react'
import invariant from 'tiny-invariant'
import {Button, LinkButton} from '~/components/buttons/button'
import {
  BillAmount,
  CartItemDetails,
  FlexRow,
  H3,
  H4,
  H5,
  Help,
  Modal,
  RestaurantInfoCard,
  Spacer,
  UserButton,
} from '~/components/index'
import {prisma} from '~/db.server'
import {getBranch} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getTable} from '~/models/table.server'
import type {User} from '~/models/user.server'
import {getPaidUsers} from '~/models/user.server'
import {getSession, sessionStorage} from '~/session.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'
//
export async function loader({request, params}: DataFunctionArgs) {
  const {tableId} = params

  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  // const userId =await  getUserId(request)
  // const username =await  getUsername(request)

  // if (userId && username) {
  //   const userValidations = await validateUserIntegration(
  //     userId,
  //     tableId,
  //     username,
  //   )
  // }

  const table = await getTable(tableId)

  const usersInTable = await prisma.user.findMany({
    where: {
      tableId: tableId,
    },
  })

  const order = await prisma.order.findFirst({
    where: {tableId, active: true},
    include: {cartItems: true, users: {include: {cartItems: true}}},
  })

  // console.log('order', order)
  let paidUsers = null
  let amountLeft = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
    amountLeft = await getAmountLeftToPay(tableId)
  }

  const total = Number(order?.total)

  const menu = await getMenu(branch.id)

  const currency = getCurrency(menu?.currency)

  //FIX If user doesn't have order then put values to 0. "esto es porque si no ponen click en terminar orden, se quedara registrado el pago anterior"
  //SOLUCIÓN puede ser eliminar a los usuarios que empiecen con GUEST

  const errors =
    !menu && `${branch?.name} no cuenta con un menu abierto en este horario.`

  return json({
    table,
    branch,
    menu,
    order,
    total,
    currency,
    amountLeft,
    paidUsers,
    errors,
    usersInTable,
  })
}

//payment ACTION
export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'Mesa no encontrada!')
  const formData = await request.formData()
  const _action = formData.get('_action') as string
  const session = await getSession(request)

  switch (_action) {
    case 'endOrder':
      console.log('ending order')
      const order = await prisma.order.findFirst({
        where: {
          tableId,
          active: true,
        },
        include: {
          users: true,
        },
      })
      invariant(order, 'Orden no existe')
      // Update each user to set `paid` to 0
      for (let user of order.users) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            tip: 0,
            paid: 0,
            total: 0,
            cartItems: {set: []},
            // tableId: null,
            // tables: {disconnect: true},
          },
        })
      }
      await prisma.table.update({
        where: {
          id: tableId,
        },
        data: {
          users: {set: []},
        },
      })
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          active: false,
          table: {disconnect: true},
          users: {set: []},
        },
      })
      session.unset('cart')
      return redirect('/thankyou', {
        headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
      })
  }

  return json({success: true})
}

interface UserWithCart extends User {
  cartItems: CartItem[]
}

export default function Table() {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()
  // const data = useLiveLoader()
  // console.log('dataLive', dataLive)
  // console.log('data', data)

  if (data.total > 0) {
    return (
      <div className="dark:text-mainTextDark dark:bg-night-100 ">
        <RestaurantInfoCard
          branch={data.branch}
          // tableId={data.table.id}
          menuId={data.menu?.id}
          errors={data.errors}
        />
        <Spacer spaceY="2">
          <h3 className="flex justify-center text-sm text-secondaryTextDark shrink-0">
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        <Help />
        <div className="p-1 bg-blue-200">
          <BillAmount
            total={data.total}
            currency={data.currency}
            amountLeft={data.amountLeft}
            usersPaid={data.paidUsers}
            userId={data.userId}
            // isPaying={isPaying}
          />
        </div>
        <Spacer spaceY="2" />
        <FlexRow justify="center" className="bg-red-200">
          <NavLink
            to="."
            className="p-2 text-sm bg-blue-500 rounded-full"
            preventScrollReset
          >
            Ver orden por platillos
          </NavLink>
          <NavLink
            to="?filter=perUser"
            className="p-2 text-sm bg-blue-500 rounded-full"
            preventScrollReset
          >
            Ver orden por usuarios
          </NavLink>
        </FlexRow>
        <Spacer spaceY="2" />
        {searchParams.get('filter') === 'perUser' ? (
          <div className="space-y-2">
            {data.order.users.map((user: UserWithCart) => {
              return (
                <div key={user.id}>
                  <FlexRow
                    justify="between"
                    className="p-2 bg-purple-400 rounded-xl"
                  >
                    <div>
                      <h1>{user.name}</h1>
                      <H5>
                        {Number(user.paid) > 0
                          ? Number(user.paid)
                          : 'No ha pagado'}
                      </H5>
                    </div>
                    <NavLink
                      preventScrollReset
                      to={`?filter=${searchParams.get('filter')}&userId=${
                        user.id
                      }`}
                    >
                      Detalles
                    </NavLink>
                  </FlexRow>
                  {searchParams.get('userId') === user.id && (
                    <div>
                      {user.cartItems.length > 0 ? (
                        <div>
                          {user.cartItems.map((cartItem: CartItem) => {
                            return (
                              <CartItemDetails
                                cartItem={cartItem}
                                key={cartItem.id}
                              />
                            )
                          })}
                        </div>
                      ) : (
                        <H5 variant="secondary">
                          Usuario no cuenta con platillos ordenados
                        </H5>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {data.order.cartItems.map((cartItem: CartItem) => {
              return <CartItemDetails cartItem={cartItem} key={cartItem.id} />
            })}
          </div>
        )}

        <PayButtons />
      </div>
    )
  } else {
    return (
      <div>
        <RestaurantInfoCard
          branch={data.branch}
          // tableId={data.table.id}
          menuId={data.menu?.id}
          errors={data.errors}
        />
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm dark:bg-secondaryDark ">
          <ChevronDoubleUpIcon className="w-5 h-5 motion-safe:animate-bounce" />
        </div>
        <H5>Aún no existe una orden con platillos.</H5>
        <Spacer spaceY="3">
          <h3 className="flex justify-center pr-2 text-sm text-secondaryTextDark shrink-0">
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        <div className="flex flex-col justify-start p-2 bg-white rounded-lg dark:bg-DARK_1 drop-shadow-md dark:drop-shadow-none">
          <p className="text-DARK_3">Usuarios en la mesa</p>
          <Spacer spaceY="2">
            <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
          </Spacer>
          {data.usersInTable?.map((user: User, index: number) => (
            <FlexRow
              className="items-center justify-between w-full space-x-2 space-y-2"
              key={user.id}
            >
              <FlexRow className="items-center space-x-2">
                <UserButton userColor={user?.color} path={`user/${user?.id}`} />
                {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
              </FlexRow>
              <div>
                <Link
                  to={`user/${user?.id}`}
                  className="flex flex-row items-center justify-center px-2 py-1 rounded-full dark:bg-buttonBgDark bg-componentBg "
                >
                  Detalles
                </Link>
              </div>
            </FlexRow>
          ))}
        </div>
        <div>
          TODO:
          <ol>
            <li>
              {' '}
              - Cuando usuario se une, que automaticamente lo muestre, que no
              tenga que hacer reload
            </li>
          </ol>
        </div>
      </div>
    )
  }
}

function PayButtons() {
  const data = useLoaderData()
  const [showSplit, setShowSplit] = useState(false)
  const revalidator = useRevalidator()

  const handleValidate = () => {
    revalidator.revalidate()
  }

  if (data.amountLeft > 0) {
    return (
      <div className="flex flex-col space-y-2">
        <Button
          onClick={() => setShowSplit(true)}
          variant="primary"
          size="large"
        >
          Dividir Cuenta
        </Button>
        <LinkButton to="pay/fullpay">Pagar la cuenta completa</LinkButton>
        {showSplit && (
          <Modal onClose={() => setShowSplit(false)} title="Dividir cuenta">
            <div className="flex flex-col space-y-2">
              <LinkButton to="pay/perDish">Pagar por platillo</LinkButton>
              <LinkButton to="pay/perPerson">Pagar por usuario</LinkButton>
              <LinkButton to="pay/equalParts">
                Pagar en partes iguales
              </LinkButton>
              <LinkButton to="pay/custom">Pagar monto personalizado</LinkButton>
            </div>
          </Modal>
        )}
      </div>
    )
  } else {
    return (
      <Form method="POST">
        <Button name="_action" value="endOrder" onClick={handleValidate}>
          Terminar orden
        </Button>
      </Form>
    )
  }
}
