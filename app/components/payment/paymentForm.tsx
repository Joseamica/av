import { useNavigation } from '@remix-run/react'
import React from 'react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { ChevronRightIcon, ChevronUpIcon } from '..'
import { SubModal } from '../modal'
import Payment, { usePayment } from './paymentV3'

import { Translate, formatCurrency } from '~/utils'

import { Button } from '~/components/ui/buttons/button'
import { FlexRow } from '~/components/util/flexrow'
import { Spacer } from '~/components/util/spacer'
import { H2, H3, H5, H6 } from '~/components/util/typography'

const variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.4 },
    },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

/**
 * Component UI with two form fields
 * paymentMethod and
 * tipPercentage
 * @param currency
 * @param tipsPercentages tips percentages
 * @param paymentMethods payment method cash or card
 * @param amountLeft remaining payment
 * @param amountToPayState user amount to pay of total account
 * @returns UI
 */
export function PaymentForm() {
  const context = usePayment()

  const navigation = useNavigation()

  const isSubmitting = navigation.state !== 'idle'

  const showPayContent = context.total > 0

  return (
    <>
      <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-2 border-button-textNotSelected border-opacity-70 bg-day-bg_principal px-3">
        <Spacer spaceY="2" />
        <FlexRow justify="between" className={clsx({ 'py-2': !showPayContent })}>
          {showPayContent ? <H5>Queda por pagar en la mesa:</H5> : <H3>Queda por pagar:</H3>}
          {showPayContent ? (
            <H3>{formatCurrency(context.currency, context.amountLeft ? context.amountLeft : context.total)}</H3>
          ) : (
            <H2>{formatCurrency(context.currency, context.amountLeft ? context.amountLeft : context.total)}</H2>
          )}
        </FlexRow>
        <Spacer spaceY="1" />
        <AnimatePresence initial={false}>
          {showPayContent && (
            <motion.div variants={variants} initial="hidden" animate={showPayContent ? 'visible' : 'hidden'} exit="hidden" className="flex flex-col">
              <hr />
              <Spacer spaceY="2" />

              <Payment.Tip />

              <Spacer spaceY="2" />

              <Payment.PayButton />

              <Spacer spaceY="1" />
              <hr />
              <Spacer spaceY="1" />

              <FlexRow justify="between">
                <Payment.PayTotal />
              </FlexRow>

              <Spacer spaceY="2" />
              <Button fullWith={true} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Pagar'}{' '}
                {formatCurrency(
                  context.currency,
                  context.total, // Update the total amount
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {context.showModal.tip && <Payment.TipModal />}

      {context.showModal.payment && <Payment.PayModal />}

      <input type="hidden" name="paymentMethod" value={context.paymentRadio} />
    </>
  )
}
