import {UserCircleIcon, ChevronDownIcon} from '@heroicons/react/outline'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import {formatCurrency} from '~/utils'
import {CartItemDetails} from '../cart-item-details'
import {SectionContainer} from '../containers/section-container'
import {FlexRow} from '../util/flexrow'
import {Spacer} from '../util/spacer'
import {H3, H6} from '../util/typography'

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
                    <FlexRow className="items-center space-x-2">
                      <UserCircleIcon
                        fill={user.color || '#000'}
                        className="min-h-10 min-w-10 h-8 w-8"
                      />
                      <div className="flex flex-col">
                        <H3>{user.name}</H3>
                        <H6>
                          {Number(user.paid) > 0
                            ? `Pagado: ${formatCurrency(currency, userPaid)}`
                            : 'No ha pagado'}
                        </H6>
                        <FlexRow>
                          <H6>
                            {user.cartItems?.length === 1
                              ? `${user.cartItems?.length} platillo ordenado`
                              : `${user.cartItems?.length} platillos ordenado` ||
                                0}
                          </H6>
                          <H6>
                            (
                            {formatCurrency(
                              currency,
                              user.cartItems.reduce(
                                (sum, item) => sum + item.price,
                                0,
                              ),
                            )}
                            )
                          </H6>
                        </FlexRow>
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
