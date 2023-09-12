import { conform, useForm } from '@conform-to/react'
import * as Separator from '@radix-ui/react-separator'
import { useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import React from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import type { CartItem, Modifiers, User } from '@prisma/client'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { addToCart, getSession, sessionStorage } from '~/session.server'

import { getBranch, getBranchId } from '~/models/branch.server'
import { getCartItems } from '~/models/cart.server'
import { getMenu } from '~/models/menu.server'

import { formatCurrency, getCurrency } from '~/utils'

import { Button, FlexRow, H3, H4, H5, H6, Modal, QuantityButton, SendComments, Spacer } from '~/components'
import { ErrorList } from '~/components/forms'

export const handle = { backButton: true, searchButton: true, path: 'menu' }

const createModifierSchema = min => {
  if (min > 0) {
    return z.array(z.string()).nonempty('You must select at least 1')
  }
  return z.array(z.string()).optional()
}

// const productIdSchema = z.object({
//   modifier: z.array(z.string()).nonempty('You must select at least 1'),
//   productId: z.string(),
//   quantity: z.number().min(1).max(10),
//   shareDish: z.array(z.string()).optional(),
//   sendComments: z.string().optional(),
// })

const createDynamicSchema = modifierGroups => {
  let dynamicFields = {}

  modifierGroups.forEach(group => {
    dynamicFields[group.id] = createModifierSchema(group.min)
  })

  return z.object({
    ...dynamicFields,
    productId: z.string(),
    quantity: z.number().min(1).max(10),
    shareDish: z.array(z.string()).optional(),
    sendComments: z.string().optional(),
  })
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, menuId, productId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const product = await prisma.menuItem.findFirst({
    where: { id: productId },
  })

  const session = await getSession(request)

  const categories = await prisma.menuCategory.findMany({
    where: { menu: { some: { id: menuId } } },
    include: {
      menuItems: true,
    },
  })

  const modifierGroup = await prisma.modifierGroup.findMany({
    where: { menuItems: { some: { id: productId } } },
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
    product,
    currency,
    menu,
    branch,
  })
}
export async function action({ request, params }: ActionArgs) {
  const { tableId, productId } = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()

  const modifierGroup = await prisma.modifierGroup.findMany({
    where: { menuItems: { some: { id: productId } } },
  })

  const dynamicSchema = createDynamicSchema(modifierGroup)

  const submission = parse(formData, {
    schema: dynamicSchema,
  })

  console.log('submission', submission)

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }
  const { value } = submission

  const session = await getSession(request)
  const cart = JSON.parse(session.get('cart') || '[]')
  const allSelectedModifierIds = Object.values(modifierGroup)
    .flat()
    .map(item => (Array.isArray(item) ? item : [item]))
    .flat()

  console.log('', allSelectedModifierIds)
  addToCart(cart, value.productId, value.quantity, allSelectedModifierIds)
  session.set('cart', JSON.stringify(cart))
  session.set('shareUserIds', JSON.stringify(value.shareDish))
  return redirect(`/table/${tableId}/menu/${params.menuId}`, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}

export default function ProductId() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const params = useParams()
  // console.log('fetcher', fetcher)
  const [quantity, setQuantity] = React.useState<number>(1)

  const [form, fields] = useForm({
    id: 'productId',
    constraint: getFieldsetConstraint(createDynamicSchema(data.modifierGroup)),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: createDynamicSchema(data.modifierGroup) })
    },
    shouldRevalidate: 'onBlur',
  })

  let isSubmitting = fetcher.state !== 'idle'

  return (
    <Modal
      onClose={() => navigate(`/table/${params.tableId}/menu/${params.menuId}`)}
      title={data.product.name}
      imgHeader={data.product.image}
    >
      <fetcher.Form method="POST" className="w-full h-full p-4 space-y-2 bg-white" {...form.props}>
        <H3 boldVariant="semibold">{data.product.name}</H3>
        <H4> {formatCurrency(data.currency, data.product?.price)}</H4>
        <H5 variant="secondary">{data.product.description}</H5>
        <QuantityButton
          onDecrease={() => setQuantity(quantity - 1)}
          onIncrease={() => setQuantity(quantity + 1)}
          quantity={quantity}
          disabled={quantity <= 1}
        />
        <Spacer>
          <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px " />
        </Spacer>
        {data.usersOnTable.length > 0 && <H4>¿Quieres compartir?</H4>}
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

        <Spacer>
          <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px " />
        </Spacer>
        <div className="space-y-4">
          {data.modifierGroup.map((modifierGroup: any) => {
            return (
              <div key={modifierGroup.id} className="space-y-2">
                <FlexRow justify="between">
                  <FlexRow>
                    <H3> {modifierGroup.name}</H3>
                    <H6>Min {modifierGroup.min}</H6>
                    <H6>max {modifierGroup.max}.</H6>
                  </FlexRow>
                  <div className="px-3  border rounded-full">{modifierGroup.min > 0 ? <H6>Requerido</H6> : <H6>Opcional</H6>}</div>
                </FlexRow>
                <div className="flex flex-col space-y-2">
                  {conform
                    .collection(fields[modifierGroup.id], {
                      type: 'checkbox',
                      options: modifierGroup.modifiers.map((modifier: Modifiers) => {
                        return modifier.id
                      }),
                    })
                    .map((props, index) => {
                      const correspondingModifier = modifierGroup.modifiers.find((modifier: Modifiers) => modifier.id === props.value)
                      console.log(modifierGroup.min)
                      // Safeguard in case correspondingModifier is undefined
                      if (!correspondingModifier) {
                        return null
                      }

                      return (
                        <label htmlFor={props.id} key={index} className="flex flex-row space-x-3 text-sm justify-between items-center">
                          <FlexRow>
                            <input {...props} />
                            <H5>{correspondingModifier.name}</H5>
                          </FlexRow>
                          <H5 className="place-content-end">{formatCurrency(data.currency, Number(correspondingModifier.extraPrice))}</H5>
                        </label>
                      )
                    })}
                  <ErrorList errors={[fields[modifierGroup.id]?.error]} />
                </div>
              </div>
            )
          })}
        </div>

        <Spacer spaceY="1" />
        <SendComments />

        <Button name="_action" value="proceed" fullWith={true} disabled={isSubmitting} className="sticky bottom-5">
          Agregar {data.product.name}
        </Button>
        <input type="hidden" name="productId" value={data.product.id} />
        <input type="hidden" name="quantity" value={quantity} />
      </fetcher.Form>
    </Modal>
  )
}