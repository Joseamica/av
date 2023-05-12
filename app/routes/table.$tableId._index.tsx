import {ChevronDoubleUpIcon} from '@heroicons/react/outline'
import type {DataFunctionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {BillAmount} from '~/components/billAmount'
import {UserButton} from '~/components/buttons/UserButton'
import {Help} from '~/components/help'
import {RestaurantInfoCard} from '~/components/restInfo'
import {FlexRow} from '~/components/util/flexrow'
import {Spacer} from '~/components/util/spacer'
import {H4, H5} from '~/components/util/typography'
import {getBranch} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'

import {useState} from 'react'
import {Button, LinkButton} from '~/components/buttons/button'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'
import type {User} from '~/models/user.server'
import {getUsersPaid} from '~/models/user.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'
//
export async function loader({request, params}: DataFunctionArgs) {
  const {tableId} = params

  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const table = await getTable(tableId)

  const usersInTable = await prisma.user.findMany({
    where: {
      tableId: tableId,
    },
  })

  //Todo Cuando cree la ruta de cart, y submit pedido, ahi es cuando se creara la orden

  // const order = await findOrCreateOrder(branch.id, tableId)
  const order = await prisma.order.findFirst({
    where: {tableId: tableId, active: true},
  })
  // console.log('order', order)

  const paidUsers = await getUsersPaid(order?.id)

  const total = Number(order?.total)

  const menu = await getMenu(branch.id)

  const currency = getCurrency(menu?.currency)

  const amountLeft = await getAmountLeftToPay(order?.id)

  const errors = !menu
    ? `${branch?.name} no cuenta con un menu abierto en este horario.`
    : ''

  return json({
    table,
    branch,
    menu,
    // order,
    total,
    currency,
    amountLeft,
    paidUsers,
    errors,
    usersInTable,
  })
}

export default function Table() {
  const data = useLoaderData()

  const [showModal, setShowModal] = useState({split: false, pay: false})

  if (data.total > 0) {
    return (
      <div className="dark:text-mainTextDark bg-green-400">
        <RestaurantInfoCard
          branch={data.branch}
          // tableId={data.table.id}
          menuId={data.menu?.id}
          errors={data.errors}
        />
        <Spacer spaceY="2">
          <h3 className="text-secondaryTextDark flex shrink-0 justify-center text-sm">
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        <Help />
        <div className="bg-blue-200 p-1">
          <BillAmount
            total={data.total}
            currency={data.currency}
            amountLeft={data.amountLeft}
            usersPaid={data.paidUsers}
            userId={data.userId}
            // isPaying={isPaying}
          />
        </div>
        <Button
          onClick={() => setShowModal({...showModal, split: true})}
          variant="primary"
          size="large"
        >
          Dividir Cuenta
        </Button>
        <LinkButton to="pay">Pagar la cuenta completa</LinkButton>
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
        <div className="dark:bg-secondaryDark flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ">
          <ChevronDoubleUpIcon className="h-5 w-5 motion-safe:animate-bounce" />
        </div>
        <H5>Aún no existe una orden con platillos.</H5>
        <Spacer spaceY="3">
          <h3 className="text-secondaryTextDark flex shrink-0 justify-center pr-2 text-sm">
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        <div className="dark:bg-DARK_1 flex flex-col justify-start rounded-lg bg-white p-2 drop-shadow-md dark:drop-shadow-none">
          <p className="text-DARK_3">Usuarios en la mesa</p>
          <Spacer spaceY="2">
            <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
          </Spacer>
          {data.usersInTable?.map((user: User, index: number) => (
            <FlexRow
              className="w-full items-center justify-between space-x-2 space-y-2"
              key={user.id}
            >
              <FlexRow className="items-center space-x-2">
                <UserButton userColor={user?.color} path={`user/${user?.id}`} />
                {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
              </FlexRow>
              <div>
                <Link
                  to={`user/${user?.id}`}
                  className="dark:bg-buttonBgDark bg-componentBg flex flex-row items-center justify-center rounded-full px-2 py-1 "
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
    // } else {
    //   return <div>a</div>
    // }
  }
}
// function Modal({children, onClose}) {
//   return (
//     <div
//       className="fixed inset-0 h-screen w-full bg-black bg-opacity-40"
//       onClick={onClose}
//     >
//       <dialog
//         className="fixed top-20 bg-white"
//         open
//         onClick={event => event.stopPropagation()}
//       >
//         {children}
//       </dialog>
//     </div>
//   )
// }
