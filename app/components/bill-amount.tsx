import { useState } from 'react'

import type { User } from '@prisma/client'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { FlexRow } from './util/flexrow'
import { H2, H4, H5 } from './util/typography'

import { formatCurrency } from '~/utils'

import { ChevronDownIcon, ChevronUpIcon, SectionContainer, UserCircleIcon } from '~/components'

export function BillAmount({
  userIsPaying,
  amountLeft,
  total,
  currency,
  paidUsers,
  userId,
}: {
  userIsPaying?: any
  amountLeft: number
  total: number
  currency: string
  paidUsers: any
  userId: string
}) {
  // const data = useLoaderData()

  const [showDetails, setShowDetails] = useState(false)
  return (
    <SectionContainer className="">
      <FlexRow className="justify-between p-2">
        <H2>Cuenta Total</H2>
        <H2
          className={clsx('text-xl', {
            'dark:decoration-DARK_PRIMARY_1   decoration-principal  line-through decoration-2': amountLeft < total,
          })}
        >
          {formatCurrency(currency, Number(total))}
        </H2>
      </FlexRow>
      {amountLeft < total ? (
        <div className="flex flex-col p-2">
          <FlexRow className="justify-between">
            <H2>Por Pagar</H2>
            <div className="flex flex-col">
              <H2> {formatCurrency(currency, Number(amountLeft))}</H2>
              <svg
                viewBox="0 0 72 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="_6c0fqz5 r7kwpu12"
              >
                <path
                  d="M72 2.994c-.132.292-.329.525-.451.824-.075.188-.218.266-.4.244-.777-.09-1.547-.243-2.327-.32-.73-.075-1.461-.1-2.192-.134a73.572 73.572 0 0 1-3.847-.295c-.315-.032-.63-.075-.947-.08-1.323-.031-2.64-.217-3.962-.28-.679-.033-1.359-.05-2.038-.1-1.588-.116-3.18-.112-4.77-.18-.92-.04-1.838-.036-2.758-.039-3.123-.01-6.246-.01-9.37 0-1.757.008-3.516.048-5.274.089-1.492.033-2.983.07-4.474.14-1.393.064-2.786.158-4.179.23-1.104.058-2.21.114-3.312.225-1.488.15-2.978.212-4.466.353-1.162.112-2.328.175-3.488.32-1.1.138-2.201.27-3.303.41-1.19.15-2.376.325-3.564.482-1.13.15-2.255.349-3.38.548-.665.118-1.325.277-1.987.423a3.053 3.053 0 0 0-.37.135c-.3 0-.603-.022-.901.008-.213.021-.267-.07-.229-.307.11-.346.185-.707.227-1.075a.811.811 0 0 1 .084-.295.632.632 0 0 1 .179-.217 3.231 3.231 0 0 1 1.08-.6c1.684-.509 3.399-.792 5.107-1.107 1.123-.21 2.25-.398 3.38-.552 1.757-.24 3.513-.486 5.276-.65A355.09 355.09 0 0 1 19.72.818c.966-.08 1.932-.159 2.899-.225 1.57-.103 3.139-.187 4.708-.291 1.3-.09 2.605-.103 3.908-.154 1.503-.06 3.007-.06 4.51-.086.109 0 .22.015.32-.061h13.029c.08.05.17.072.26.06.951.016 1.899.02 2.85.061 1.232.053 2.465.083 3.697.178 1.16.09 2.32.141 3.482.276 1.369.158 2.737.25 4.1.466 1.119.178 2.237.358 3.346.604 1.402.31 2.78.778 4.198.984.327.047.677.047.972.29l.001.073Z"
                  className="fill-day-principal dark:fill-night-100"
                ></path>
              </svg>
            </div>
          </FlexRow>
          <button className="flex flex-row items-center mb-2 space-x-1 text-sm" onClick={() => setShowDetails(!showDetails)}>
            <H5>{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</H5>
            {showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          <AnimatePresence>
            {showDetails &&
              paidUsers &&
              paidUsers.map((payment: any, index: number) => {
                const user = payment.user as User

                return (
                  <motion.div
                    key={index}
                    className="flex flex-row justify-between w-full space-x-1"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                  >
                    <div className="flex flex-row items-center space-x-1">
                      {/* to={`./user/${user?.id}`}> */}
                      <UserCircleIcon
                        // userColor={user.color}
                        fill={user?.color || '#000'}
                      />

                      {userId === user?.id ? <H4>has pagado</H4> : <H4>{user?.name} ha pagado</H4>}
                    </div>
                    <H4>{formatCurrency(currency, Number(payment.amount))}</H4>
                  </motion.div>
                )
              })}
            {userIsPaying ? (
              <motion.div>
                <p>esta pagando en este momento...</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </SectionContainer>
  )
}
