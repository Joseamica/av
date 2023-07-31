import {
  UserCircleIcon,
  ChevronDownIcon,
  DotsVerticalIcon,
} from '@heroicons/react/solid'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import {formatCurrency} from '~/utils'
import {CartItemDetails} from '../cart-item-details'
import {SectionContainer} from '../containers/section-container'
import {FlexRow} from '../util/flexrow'
import {Spacer} from '../util/spacer'
import {H3, H4, H5, H6} from '../util/typography'
import {
  CashIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ViewListIcon,
} from '@heroicons/react/outline'
import {IoFastFoodOutline} from 'react-icons/io5'
import {
  FaClipboardList,
  FaFirstOrder,
  FaList,
  FaListAlt,
  FaListOl,
  FaMoneyBill,
  FaShoppingBag,
  FaShoppingCart,
} from 'react-icons/fa'
import {IoMdListBox} from 'react-icons/io'

export function FilterUserView({
  order,
  currency,
  handleToggleUser,
  selectedUsers,
}: {
  order: any
  currency: string
  handleToggleUser: (userId: string) => void
  selectedUsers: string[]
}) {
  return (
    <AnimatePresence>
      <div className="space-y-2">
        {order.users &&
          order.users.map((user: any) => {
            const userPaid = Number(user.paid)
            return (
              <SectionContainer key={user.id} as="div">
                <FlexRow justify="between" className="rounded-xl px-1 ">
                  <Spacer spaceY="2">
                    <FlexRow className="items-center space-x-2 divide-x-2">
                      <div className="flex flex-col items-center rounded-xl p-1  ">
                        <UserCircleIcon
                          fill={user.color || '#000'}
                          className="min-h-10 min-w-10 h-8 w-8"
                        />
                        <H3>{user.name}</H3>
                      </div>
                      <div className="flex flex-col space-y-2 p-2">
                        {user.cartItems?.length === 1 ? (
                          <div className="flex space-x-2">
                            <IoFastFoodOutline className="h-5 w-5 flex-shrink-0" />
                            <p className="w-full text-sm">
                              {user.cartItems?.length} producto
                            </p>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <IoFastFoodOutline className="h-5 w-5 flex-shrink-0" />
                            <p className="w-full text-sm">
                              {user.cartItems?.length} productos
                            </p>
                          </div>
                        )}
                        {user.cartItems?.length > 0 && (
                          <div className="flex space-x-2">
                            <ShoppingCartIcon className="h-5 w-5 flex-shrink-0" />
                            <p className="w-full text-sm">
                              {formatCurrency(
                                currency,
                                user.cartItems.reduce(
                                  (sum, item) => sum + item.price,
                                  0,
                                ),
                              )}{' '}
                              de orden
                            </p>
                          </div>
                        )}
                        {Number(user.paid) > 0 ? (
                          <div className="flex space-x-2">
                            <CashIcon className="h-5 w-5 flex-shrink-0" />
                            <p className="w-full text-sm">
                              {formatCurrency(currency, userPaid)} pagado
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">No ha pagado</p>
                        )}
                      </div>
                    </FlexRow>
                  </Spacer>
                  <button
                    onClick={() => handleToggleUser(user.id)}
                    className={clsx(
                      'flex items-center justify-center rounded-lg  border border-button-outline px-1   py-1 text-xs',
                      {
                        'bg-button-primary text-white': selectedUsers.includes(
                          user.id,
                        ),
                      },
                    )}
                  >
                    Detalles
                    <ChevronDownIcon className={clsx('h-3 w-3 ', {})} />
                  </button>
                </FlexRow>
                <AnimatePresence>
                  {selectedUsers.includes(user.id) && (
                    <motion.div
                      className="flex flex-col"
                      key={user.id}
                      initial={{
                        opacity: 0,
                        height: '0',
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                      }}
                      exit={{
                        opacity: 0,
                        height: '0',
                      }}
                      transition={{
                        opacity: {
                          duration: 0.2,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        },
                        height: {
                          duration: 0.4,
                        },
                      }}
                    >
                      <hr />
                      {user.cartItems.length > 0 ? (
                        <motion.div>
                          {user.cartItems.map((cartItem: any) => (
                            <CartItemDetails
                              key={cartItem.id}
                              cartItem={cartItem}
                            />
                          ))}
                        </motion.div>
                      ) : (
                        <Spacer spaceY="2" className="px-2">
                          <H6 variant="secondary">
                            Usuario no cuenta con platillos ordenados
                          </H6>
                        </Spacer>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* <hr /> */}
              </SectionContainer>
            )
          })}
      </div>
    </AnimatePresence>
  )
}
