import {ChevronRightIcon} from '@heroicons/react/outline'
import {ChevronUpIcon} from '@heroicons/react/solid'
import {AnimatePresence, motion} from 'framer-motion'
import React, {useEffect, useState} from 'react'
import {formatCurrency} from '~/utils'
import {Button} from './buttons/button'
import {RadioInputButton} from './buttons/input'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H3, H5, H6} from './util/typography'
import {Modal} from './modals'

const variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: {duration: 0.2},
      height: {duration: 0.4},
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

export function Payment({
  total = 0,
  tip,
  tipsPercentages,
  paymentMethods,
  currency,
  error,
  amountLeft,
}: {
  total: number
  tip: number
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
  error?: string
  amountLeft?: number
}) {
  const [activeRadioPaymentMethod, setActiveRadioPaymentMethod] =
    React.useState<string>('cash')

  const handleChangePaymentMethod = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setActiveRadioPaymentMethod(event.target.value)
  }

  const [activeRadioTip, setActiveRadioTip] = React.useState<string>('12')

  const handleChangeTip = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRadioTip(event.target.value)
  }

  const [showChangeMethod, setShowChangeMethod] = useState(false)

  const [payMethodName, setPayMethodName] = useState('Efectivo')

  useEffect(() => {
    if (activeRadioPaymentMethod === 'card') {
      setPayMethodName('Tarjeta')
    } else if (activeRadioPaymentMethod === 'paypal') {
      setPayMethodName('Paypal')
    } else {
      setPayMethodName('Efectivo')
    }
  }, [activeRadioPaymentMethod])

  const [showAddTip, setShowAddTip] = useState(false)

  return (
    <>
      <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-4 bg-day-bg_principal px-3">
        <Spacer spaceY="2" />
        <FlexRow justify="between">
          <H5>Queda por pagar:</H5>
          <H3>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H3>
        </FlexRow>
        <Spacer spaceY="1" />
        <AnimatePresence initial={false}>
          {total > 0 && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate={total > 0 ? 'visible' : 'hidden'}
              exit="hidden"
              className="flex flex-col"
            >
              <FlexRow justify="between">
                <H5>Total seleccionado:</H5>
                <H3>{formatCurrency(currency, total ? total : 0)}</H3>
              </FlexRow>
              <Spacer spaceY="1" />
              <hr />
              <Spacer spaceY="1" />
              <button
                className="flex flex-row items-center justify-between"
                onClick={() => setShowChangeMethod(!showChangeMethod)}
              >
                <H5>Método de pago</H5>
                <FlexRow>
                  <H3>{payMethodName}</H3>
                  {showChangeMethod ? (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cerrar</H6>
                      <ChevronUpIcon className="h-4 w-4" />
                    </FlexRow>
                  ) : (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cambiar</H6>
                      <ChevronRightIcon className="h-4 w-4" />
                    </FlexRow>
                  )}
                </FlexRow>
              </button>
              <Spacer spaceY="1" />

              <Spacer spaceY="3" />
              <button
                className="flex flex-row items-center justify-between"
                onClick={() => setShowAddTip(!showAddTip)}
                type="button"
              >
                <H5>Propina</H5>
                <FlexRow>
                  <H3>{activeRadioTip}%</H3>
                  {showAddTip ? (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cerrar</H6>
                      <ChevronUpIcon className="h-4 w-4" />
                    </FlexRow>
                  ) : (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cambiar</H6>
                      <ChevronRightIcon className="h-4 w-4" />
                    </FlexRow>
                  )}
                </FlexRow>
              </button>
              <Spacer spaceY="1" />
            </motion.div>
          )}
        </AnimatePresence>
        <Spacer spaceY="2" />
        <Button name="_action" value="proceed" disabled={total <= 0}>
          Pagar{' '}
          {formatCurrency(currency, Number(total || 0) + Number(tip || 0))}
        </Button>
        <input
          type="hidden"
          name="paymentMethod"
          value={activeRadioPaymentMethod}
        />
      </div>
      <Modal
        isOpen={showChangeMethod}
        handleClose={() => setShowChangeMethod(false)}
        title="Método de pago"
      >
        <div className="flex flex-col items-center space-y-2 bg-white p-4">
          {Object.values(paymentMethods).map(paymentMethod => (
            <RadioInputButton
              disabled={total <= 0}
              key={paymentMethod}
              title={paymentMethod}
              state={activeRadioPaymentMethod}
              id={paymentMethod}
              type="radio"
              name="paymentMethod"
              value={paymentMethod}
              className="w-full "
              handlerFunction={handleChangePaymentMethod}
            />
          ))}
          <Button
            onClick={() => setShowChangeMethod(false)}
            type="button"
            fullWith={true}
          >
            Asignar
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={showAddTip}
        handleClose={() => setShowAddTip(false)}
        title="Agregar propina"
      >
        <div className="flex flex-col items-center space-y-2 bg-white p-4">
          {Object.values(tipsPercentages).map(tipPercentage => (
            <RadioInputButton
              key={tipPercentage}
              title={`${tipPercentage}%`}
              state={activeRadioTip}
              id={`${tipPercentage}`}
              type="radio"
              name="tipPercentage"
              value={`${tipPercentage}`}
              className="w-full justify-center"
              handlerFunction={handleChangeTip}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}
