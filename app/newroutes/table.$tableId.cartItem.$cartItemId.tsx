import { Form, Link, useLoaderData, useNavigate, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { User } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId } from '~/session.server'

import { FOOD_REPORT_SUBJECTS } from './table.$tableId.help.report'

import { formatCurrency, getCurrency, getDateTime } from '~/utils'

import { Button, FlexRow, H3, H4, H5, ItemContainer, LinkButton, Modal, SendComments, Spacer, StarIcon, UserCircleIcon } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, cartItemId } = params
  invariant(tableId, 'No se encontró la mesa')
  invariant(cartItemId, 'No se encontró el ID del item')

  const currency = await getCurrency(tableId)

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { user: true },
  })
  invariant(cartItem, 'No se encontró el item')
  return json({ cartItem, currency })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const _action = formData.get('_action') as string
  const url = new URL(request.url)
  const urlSearchParams = url.searchParams
  const subject = urlSearchParams.get('subject') as string
  const session = await getSession(request)

  const sendComments = formData.get('sendComments') as string
  const redirectTo = validateRedirect(request.redirect, `/table/${params.tableId}`)
  const date = getDateTime()

  switch (_action) {
    case 'report':
      await prisma.feedback.create({
        data: {
          type: 'food',
          report: subject + ' ' + sendComments,
          tableId: params.tableId,
          userId: await getUserId(session),
          cartItems: { connect: { id: params.cartItemId } },
        },
      })
      return redirect(redirectTo, { status: 303 })
    case 'rate':
      const rating = urlSearchParams.get('rating') as string
      await prisma.cartItem.update({
        where: { id: params.cartItemId },
        data: {
          rating: rating,
        },
      })
      return redirect(redirectTo, { status: 303 })

    case 'proceed':
      return redirect(redirectTo + '/pay/perDish', { status: 303 })
  }
  return json({ success: true })
}

export default function CartItemId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const report = searchParams.get('report')
  const rate = searchParams.get('rate')
  const subject = searchParams.get('subject') || undefined

  const onClose = () => {
    navigate('..')
  }
  const sharedPrice = formatCurrency(data.currency, data.cartItem.price / data.cartItem.user.length)

  return (
    <Modal onClose={onClose} title={data.cartItem.name} imgHeader={data.cartItem.image} goBack={report || rate ? true : false}>
      <Form method="POST" className="p-2">
        {report ? (
          // REPORT
          <div className="space-y-2">
            {Object.entries(FOOD_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                to={`?report=true&by=food&subject=${value}`}
                key={key}
                size="small"
                className="mx-1"
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <SendComments />
            <Button fullWith={true} name="_action" value="report">
              Reportar {data.cartItem.name}
            </Button>
          </div>
        ) : rate ? (
          // RATE
          <div>
            <Spacer spaceY="2" />
            <FlexRow justify="between" className="mx-2">
              <H3>{data.cartItem.name}</H3>
              <H4>{formatCurrency(data.currency, data.cartItem.price)}</H4>
            </FlexRow>
            <Spacer spaceY="2" />
            <FlexRow justify="center">
              {Array.from({ length: 5 }).map((_, index) => (
                <Link to={`?rate=true&rating=${index + 1}`} key={index}>
                  <StarIcon
                    key={index}
                    className={`h-8 w-8 ${index + 1 <= Number(searchParams.get('rating')) ? 'fill-yellow-500' : 'fill-gray-400'}`}
                  />
                </Link>
              ))}
            </FlexRow>
            <Spacer spaceY="2" />
            <Button fullWith={true} name="_action" value="rate">
              Calificar con {searchParams.get('rating')} estrellas
            </Button>
          </div>
        ) : (
          <>
            <Spacer spaceY="1" />
            <div className="flex flex-row items-center justify-center w-full space-x-2">
              <LinkButton to="?report=true" size="small">
                Reportar
              </LinkButton>
              {/* <Button size="small" name="_action" value="report">
            Reportar
          </Button> */}
              <Button size="small" name="_action" value="return">
                Devolver
              </Button>
              <LinkButton to="?rate=true&rating=5" size="small">
                Calificar
              </LinkButton>
            </div>
            <Spacer spaceY="2" />
            <hr />
            <Spacer spaceY="2" />
            <FlexRow justify="between" className="mx-2">
              <H3>{data.cartItem.name}</H3>
              <H4>{formatCurrency(data.currency, data.cartItem.price)}</H4>
            </FlexRow>
            <Spacer spaceY="2" />
            <hr />
            <Spacer spaceY="2" />
            <div className="space-y-1">
              {data.cartItem.user.length > 1 && <H4 className="mx-2">Pedido por:</H4>}
              {data.cartItem.user.map((user: User) => (
                <ItemContainer key={user.id} className="items-center">
                  <FlexRow>
                    <UserCircleIcon fill={user.color || '#000'} className="h-8  min-h-5 min-w-8" />
                    <H5>{user.name}</H5>
                  </FlexRow>
                  <H5>{sharedPrice}</H5>
                </ItemContainer>
              ))}
            </div>
            <Spacer spaceY="2" />
            <Button fullWith={true} name="_action" value="proceed">
              Pagar {data.cartItem.name.length > 20 ? '' : data.cartItem.name}
            </Button>
            <Spacer spaceY="2" />
          </>
        )}
      </Form>
    </Modal>
  )
}
