import {ChevronRightIcon} from '@heroicons/react/outline'
import {ChevronUpIcon} from '@heroicons/react/solid'
import {AnimatePresence, motion} from 'framer-motion'
import React, {useEffect, useState} from 'react'
import {formatCurrency} from '~/utils'
import {Button} from './buttons/button'
import {RadioInputButton} from './buttons/input'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H3, H4, H5, H6} from './util/typography'
import {Modal, SubModal} from './modal'
import {Form, useNavigation} from '@remix-run/react'
import clsx from 'clsx'

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
                <div className="flex flex-row items-center space-x-2">
                  <H4 variant="secondary">( {activeRadioTip}% )</H4>

                  <H3>
                    {formatCurrency(
                      currency,
                      (total * Number(activeRadioTip)) / 100,
                    )}
                  </H3>

                  {showAddTip ? (
                    <FlexRow className="rounded-full bg-gray_light px-2 py-1">
                      <H6>Cerrar</H6>
                      <ChevronUpIcon className="h-4 w-4" />
                    </FlexRow>
                  ) : (
                    <FlexRow className="items-center justify-center rounded-full bg-gray_light px-2 py-1">
                      {/* <H5>{activeRadioTip}%</H5> */}
                      <H6>Cambiar</H6>
                      <ChevronRightIcon className="h-4 w-4" />
                    </FlexRow>
                  )}
                </div>
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
      </div>
      {showChangeMethod && (
        <SubModal
          onClose={() => setShowChangeMethod(false)}
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
            <Spacer spaceY="1" />
            <Button
              onClick={() => setShowChangeMethod(false)}
              type="button"
              fullWith={true}
            >
              Asignar
            </Button>
          </div>
        </SubModal>
      )}

      {showAddTip && (
        <SubModal onClose={() => setShowAddTip(false)} title="Agregar propina">
          <div className="flex flex-col items-center space-y-2 bg-white p-4">
            {Object.values(tipsPercentages).map(tipPercentage => (
              <RadioInputButton
                key={tipPercentage}
                title={`${tipPercentage}% `}
                state={activeRadioTip}
                id={`${tipPercentage}`}
                type="radio"
                name="tipPercentage"
                value={`${tipPercentage}`}
                className="w-full justify-center"
                handlerFunction={handleChangeTip}
              />
            ))}

            <Spacer spaceY="1" />
            <FlexRow>
              <H5>Propina</H5>
              <H3>
                {formatCurrency(
                  currency,
                  (total * Number(activeRadioTip)) / 100,
                )}
              </H3>
            </FlexRow>
            <Button
              onClick={() => setShowAddTip(false)}
              type="button"
              fullWith={true}
            >
              Asignar
              {/* {(total * Number(activeRadioTip)) / 100} */}
            </Button>
          </div>
        </SubModal>
      )}

      <input
        type="hidden"
        name="paymentMethod"
        value={activeRadioPaymentMethod}
      />
      <input type="hidden" name="tipPercentage" value={activeRadioTip} />
    </>
  )
}

export function PaymentContainer({currency, amountLeft, total, children}) {
  return (
    <>
      <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-4 bg-day-bg_principal px-3">
        <Spacer spaceY="2" />
        <FlexRow justify="between">
          <H5>Queda por pagar:</H5>
          <H3>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H3>
        </FlexRow>
        <Spacer spaceY="1" />
        {children}
      </div>
    </>
  )
}

export function P({
  currency,
  tipsPercentages,
  paymentMethods,
  amountLeft,
  amountToPayState,
}: {
  currency: string
  tipsPercentages: any
  paymentMethods: PaymentMethod
  amountLeft: number
  amountToPayState: number
}) {
  const navigation = useNavigation()

  const [tipRadio, setTipRadio] = React.useState(12)
  const [paymentRadio, setPaymentRadio] = React.useState('cash')
  const [showModal, setShowModal] = React.useState({tip: false, payment: false})

  const handleTipChange = e => {
    setTipRadio(Number(e.target.value))
    // submit(e.target.form, {method: 'post'})
  }
  const handleMethodChange = e => {
    setPaymentRadio(e.target.value)
  }

  const tip = Number(amountToPayState) * (Number(tipRadio) / 100)
  const total = Number(amountToPayState) + tip

  const isSubmitting = navigation.state !== 'idle'

  const tipPercentages = [...Object.values(tipsPercentages), '0']

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
              <Spacer spaceY="2" />
              <button
                className="flex flex-row items-center justify-between"
                type="button"
                onClick={() => setShowModal({...showModal, tip: true})}
              >
                <H5>Propina</H5>
                <FlexRow>
                  <FlexRow>
                    <H4 variant="secondary">{tipRadio}%</H4>
                    <H3>{formatCurrency(currency, tip)}</H3>
                  </FlexRow>
                  {showModal.tip ? (
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
              <Spacer spaceY="2" />
              <button
                className="flex flex-row items-center justify-between"
                type="button"
                onClick={() => setShowModal({...showModal, payment: true})}
              >
                <H5>Método de pago</H5>
                <FlexRow>
                  <H3>{paymentRadio}</H3>
                  {showModal.payment ? (
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
              <Spacer spaceY="2" />
              <Button fullWith={true} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Pagar'}{' '}
                {formatCurrency(
                  currency,
                  total, // Update the total amount
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showModal.tip && (
        <AssignTipModal
          amountToPay={amountToPayState}
          currency={currency}
          handleTipChange={handleTipChange}
          setShowModal={setShowModal}
          showModal={showModal}
          tipPercentages={tipPercentages}
          tipRadio={tipRadio}
        />
      )}
      {showModal.payment && (
        <AssignPaymentMethodModal
          showModal={showModal}
          setShowModal={setShowModal}
          paymentMethods={paymentMethods}
          paymentRadio={paymentRadio}
          handleMethodChange={handleMethodChange}
        />
      )}
      <input type="hidden" name="paymentMethod" value={paymentRadio} />
      <input type="hidden" name="tipPercentage" value={tipRadio} />
    </>
  )
}

export function AssignTipModal({
  showModal,
  setShowModal,
  tipPercentages,
  tipRadio,
  currency,
  amountToPay,
  handleTipChange,
}) {
  return (
    <SubModal
      onClose={() => setShowModal({...showModal, tip: false})}
      title="Asignar propina"
    >
      <FlexRow justify="between">
        {tipPercentages.map((tipPercentage: any) => (
          <label
            key={tipPercentage}
            className={clsx(
              'flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
              {
                'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                  tipRadio.toString() === tipPercentage,
              },
            )}
          >
            <div>
              <H3>{tipPercentage}%</H3>
              <H5>
                {formatCurrency(
                  currency,
                  Number(amountToPay) * (Number(tipPercentage) / 100),
                )}
              </H5>
            </div>
            <input
              type="radio"
              name="tipPercentage"
              // defaultChecked={tipPercentage === '12'}
              value={tipPercentage}
              onChange={handleTipChange}
              className="sr-only"
            />
          </label>
        ))}
      </FlexRow>
      <Spacer spaceY="2" />
      <Button
        fullWith={true}
        onClick={() => setShowModal({...showModal, tip: false})}
      >
        Asignar
      </Button>
    </SubModal>
  )
}

export function AssignPaymentMethodModal({
  showModal,
  setShowModal,
  paymentMethods,
  paymentRadio,
  handleMethodChange,
}) {
  return (
    <SubModal
      onClose={() => setShowModal({...showModal, payment: false})}
      title="Asignar método de pago"
    >
      <div className="space-y-2">
        {Object.values(paymentMethods).map((paymentMethod: any) => (
          <label
            key={paymentMethod}
            className={clsx(
              'flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
              {
                'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                  paymentRadio === paymentMethod,
              },
            )}
          >
            {paymentMethod}
            <input
              type="radio"
              name="paymentMethod"
              // defaultChecked={paymentMethod === 'cash'}
              value={paymentMethod}
              onChange={handleMethodChange}
              className="sr-only"
            />
          </label>
        ))}
        <Button
          fullWith={true}
          onClick={() => setShowModal({...showModal, payment: false})}
        >
          Asignar
        </Button>
      </div>
    </SubModal>
  )
}
