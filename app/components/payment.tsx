import React, {useEffect, useState} from 'react'
import {formatCurrency} from '~/utils'
import {Button, LinkButton} from './buttons/button'
import {RadioInputButton} from './buttons/input'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H2, H3, H4, H5, H6} from './util/typography'
import {motion} from 'framer-motion'
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import {Modal} from './modals'
import {ChevronDownIcon, ChevronRightIcon} from '@heroicons/react/outline'
import {ChevronUpIcon} from '@heroicons/react/solid'

const effect = {
  hidden: {
    y: '100vh',
    opacity: 0,
  },
  visible: {
    y: '0',
    opacity: 1,
    transition: {
      type: 'linear',
      stiffness: 600,
      // duration: 3,
      damping: 30,
    },
  },
  exit: {
    y: '100vh',
    opacity: 0,
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

  const navigate = useNavigate()
  const [showAddTip, setShowAddTip] = useState(false)

  return (
    <>
      <motion.div
        variants={effect}
        className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-2 bg-day-bg_principal px-3"
      >
        {/* Radio Tip buttons */}
        {/* <H2>Deseas dejar propina</H2>
        <Spacer spaceY="2" />
        <FlexRow className="space-x-4">
          {Object.values(tipsPercentages).map(tipPercentage => (
            <RadioInputButton
              key={tipPercentage}
              title={`${tipPercentage}%`}
              state={activeRadioTip}
              id={`${tipPercentage}`}
              type="radio"
              name="tipPercentage"
              value={`${tipPercentage}`}
              className="sr-only"
              handlerFunction={handleChangeTip}
            />
          ))}
        </FlexRow> */}
        <Spacer spaceY="2" />
        {/* <H2>Método de pago</H2>
        <Spacer spaceY="2" />
        <FlexRow>
          {Object.values(paymentMethods).map(paymentMethod => (
            <RadioInputButton
              key={paymentMethod}
              title={`${paymentMethod}`}
              state={activeRadioPaymentMethod}
              id={`${paymentMethod}`}
              type="radio"
              name="paymentMethod"
              value={`${paymentMethod}`}
              className="sr-only"
              handlerFunction={handleChangePaymentMethod}
            />
          ))}
        </FlexRow>
        <Spacer spaceY="2" /> */}
        {/* Total, propina, total */}
        {/* <div>
          <FlexRow justify="between">
            <H4>Total: </H4>
            <H2 boldVariant="semibold">{formatCurrency(currency, total)}</H2>
          </FlexRow>
          <FlexRow justify="between">
            <H4>Propina:</H4>
            <H2 boldVariant="semibold">
              {formatCurrency(currency, tip ? tip : Number(total) * 0.12)}
            </H2>
          </FlexRow>
        </div> */}
        {/* <H5 boldVariant="semibold" variant="error">
          {error}
        </H5>
        <Spacer spaceY="2" /> */}
        <FlexRow justify="between">
          <H5>Queda por pagar:</H5>
          <H3>{formatCurrency(currency, amountLeft ? amountLeft : 0)}</H3>
        </FlexRow>
        <Spacer spaceY="1" />
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
        {showChangeMethod && (
          <FlexRow justify="between" className="w-full">
            {Object.values(paymentMethods).map(paymentMethod => (
              <RadioInputButton
                key={paymentMethod}
                title={`${paymentMethod}`}
                state={activeRadioPaymentMethod}
                id={`${paymentMethod}`}
                type="radio"
                name="paymentMethod"
                value={`${paymentMethod}`}
                className=""
                handlerFunction={handleChangePaymentMethod}
              />
            ))}
          </FlexRow>
        )}
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
        {showAddTip && (
          <FlexRow>
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
          </FlexRow>
        )}
        <Spacer spaceY="2" />
        <Button name="_action" value="proceed" disabled={total <= 0}>
          Pagar{' '}
          {formatCurrency(currency, Number(total || 0) + Number(tip || 0))}
        </Button>
        {/* <Button
          disabled={total <= 0}
          fullWith={true}
          type="button"
          onClick={() => setShowAddTip(true)}
        >
          Pagar {formatCurrency(currency, Number(total || 0))}
        </Button>
        <Spacer spaceY="2" /> */}
      </motion.div>
      {/* <Modal
        isOpen={showAddTip}
        handleClose={() => {
          setShowAddTip(false)
        }}
      >
        <div className="w-full space-y-2 bg-white">
          <H2>Deseas dejar propina</H2>
          <Spacer spaceY="2" />
          {Object.values(tipsPercentages).map(tipPercentage => (
            <RadioInputButton
              key={tipPercentage}
              title={`${tipPercentage}%`}
              state={activeRadioTip}
              id={`${tipPercentage}`}
              type="radio"
              name="tipPercentage"
              value={`${tipPercentage}`}
              className="sr-only"
              handlerFunction={handleChangeTip}
            />
          ))}
        </div>
      </Modal> */}
    </>
  )
}

// export function PaymentMethod({paymentMethods}) {
//   const navigate = useNavigate()
//   const [activeRadioPaymentMethod, setActiveRadioPaymentMethod] =
//     React.useState<string>('cash')
//   const handleChangePaymentMethod = (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     setActiveRadioPaymentMethod(event.target.value)
//   }

//   const onClose = () => {
//     return navigate('..')
//   }
//   return (
//     <FlexRow>
//       {Object.values(paymentMethods).map((paymentMethod, index) => (
//         <RadioInputButton
//           key={index}
//           title={`${paymentMethod}`}
//           state={activeRadioPaymentMethod}
//           id={`${paymentMethod}`}
//           type="radio"
//           name="paymentMethod"
//           value={`${paymentMethod}`}
//           className="sr-only"
//           handlerFunction={handleChangePaymentMethod}
//         />
//       ))}
//     </FlexRow>
//   )
// }
