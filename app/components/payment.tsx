import { useNavigation } from '@remix-run/react'
import React from 'react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { ChevronRightIcon, ChevronUpIcon } from './icons'
import { SubModal } from './modal'
import { Button } from './ui/buttons/button'
import { FlexRow } from './util/flexrow'
import { Spacer } from './util/spacer'
import { H2, H3, H4, H5, H6 } from './util/typography'

import { Translate, formatCurrency } from '~/utils'

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

// export function Payment({
//   total = 0,
//   tip,
//   tipsPercentages,
//   paymentMethods,
//   currency,
//   error,
//   amountLeft,
// }: {
//   total: number
//   tip: number
//   tipsPercentages: number[]
//   paymentMethods: string[]
//   currency: string
//   error?: string
//   amountLeft?: number
// }) {
//   const [activeRadioPaymentMethod, setActiveRadioPaymentMethod] =
//     React.useState<string>('cash')

//   const handleChangePaymentMethod = (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     setActiveRadioPaymentMethod(event.target.value)
//   }

//   const [activeRadioTip, setActiveRadioTip] = React.useState<string>('12')

//   const handleChangeTip = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setActiveRadioTip(event.target.value)
//   }

//   const [showChangeMethod, setShowChangeMethod] = useState(false)

//   const [payMethodName, setPayMethodName] = useState('Efectivo')

//   useEffect(() => {
//     if (activeRadioPaymentMethod === 'card') {
//       setPayMethodName('Tarjeta')
//     } else if (activeRadioPaymentMethod === 'paypal') {
//       setPayMethodName('Paypal')
//     } else {
//       setPayMethodName('Efectivo')
//     }
//   }, [activeRadioPaymentMethod])

//   const [showAddTip, setShowAddTip] = useState(false)

//   return (
//     <>
//       <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-4 bg-day-bg_principal px-3">
//         <Spacer spaceY="2" />
//         <FlexRow justify="between">
//           <H5>Queda por pagar:</H5>
//           <H3>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H3>
//         </FlexRow>
//         <Spacer spaceY="1" />
//         <AnimatePresence initial={false}>
//           {showPayContent&& (
//             <motion.div
//               variants={variants}
//               initial="hidden"
//               animate={showPayContent? 'visible' : 'hidden'}
//               exit="hidden"
//               className="flex flex-col"
//             >
//               <FlexRow justify="between">
//                 <H5>Total seleccionado:</H5>
//                 <H3>{formatCurrency(currency, total ? total : 0)}</H3>
//               </FlexRow>
//               <Spacer spaceY="1" />
//               <hr />
//               <Spacer spaceY="1" />
//               <button
//                 className="flex flex-row items-center justify-between"
//                 onClick={() => setShowChangeMethod(!showChangeMethod)}
//               >
//                 <H5>Método de pago</H5>
//                 <FlexRow>
//                   <H3>{payMethodName}</H3>
//                   {showChangeMethod ? (
//                     <FlexRow className="rounded-full bg-gray_light px-2 py-1">
//                       <H6>Cerrar</H6>
//                       <ChevronUpIcon className="h-4 w-4" />
//                     </FlexRow>
//                   ) : (
//                     <FlexRow className="rounded-full bg-gray_light px-2 py-1">
//                       <H6>Cambiar</H6>
//                       <ChevronRightIcon className="h-4 w-4" />
//                     </FlexRow>
//                   )}
//                 </FlexRow>
//               </button>
//               <Spacer spaceY="1" />

//               <Spacer spaceY="3" />
//               <button
//                 className="flex flex-row items-center justify-between"
//                 onClick={() => setShowAddTip(!showAddTip)}
//                 type="button"
//               >
//                 <H5>Propina</H5>
//                 <div className="flex flex-row items-center space-x-2">
//                   <H4 variant="secondary">( {activeRadioTip}% )</H4>

//                   <H3>
//                     {formatCurrency(
//                       currency,
//                       (total * Number(activeRadioTip)) / 100,
//                     )}
//                   </H3>

//                   {showAddTip ? (
//                     <FlexRow className="rounded-full bg-gray_light px-2 py-1">
//                       <H6>Cerrar</H6>
//                       <ChevronUpIcon className="h-4 w-4" />
//                     </FlexRow>
//                   ) : (
//                     <FlexRow className="items-center justify-center rounded-full bg-gray_light px-2 py-1">
//                       {/* <H5>{activeRadioTip}%</H5> */}
//                       <H6>Cambiar</H6>
//                       <ChevronRightIcon className="h-4 w-4" />
//                     </FlexRow>
//                   )}
//                 </div>
//               </button>
//               <Spacer spaceY="1" />
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <Spacer spaceY="2" />
//         <Button name="_action" value="proceed" disabled={total <= 0}>
//           Pagar{' '}
//           {formatCurrency(currency, Number(total || 0) + Number(tip || 0))}
//         </Button>
//       </div>
//       {showChangeMethod && (
//         <SubModal
//           onClose={() => setShowChangeMethod(false)}
//           title="Método de pago"
//         >
//           <div className="flex flex-col items-center space-y-2 bg-white p-4">
//             {Object.values(paymentMethods).map(paymentMethod => (
//               <RadioInputButton
//                 disabled={total <= 0}
//                 key={paymentMethod}
//                 title={paymentMethod}
//                 state={activeRadioPaymentMethod}
//                 id={paymentMethod}
//                 type="radio"
//                 name="paymentMethod"
//                 value={paymentMethod}
//                 className="w-full "
//                 handlerFunction={handleChangePaymentMethod}
//               />
//             ))}
//             <Spacer spaceY="1" />
//             <Button
//               onClick={() => setShowChangeMethod(false)}
//               type="button"
//               fullWith={true}
//             >
//               Asignar
//             </Button>
//           </div>
//         </SubModal>
//       )}

//       {showAddTip && (
//         <SubModal onClose={() => setShowAddTip(false)} title="Agregar propina">
//           <div className="flex flex-col items-center space-y-2 bg-white p-4">
//             {Object.values(tipsPercentages).map(tipPercentage => (
//               <RadioInputButton
//                 key={tipPercentage}
//                 title={`${tipPercentage}% `}
//                 state={activeRadioTip}
//                 id={`${tipPercentage}`}
//                 type="radio"
//                 name="tipPercentage"
//                 value={`${tipPercentage}`}
//                 className="w-full justify-center"
//                 handlerFunction={handleChangeTip}
//               />
//             ))}

//             <Spacer spaceY="1" />
//             <FlexRow>
//               <H5>Propina</H5>
//               <H3>
//                 {formatCurrency(
//                   currency,
//                   (total * Number(activeRadioTip)) / 100,
//                 )}
//               </H3>
//             </FlexRow>
//             <Button
//               onClick={() => setShowAddTip(false)}
//               type="button"
//               fullWith={true}
//             >
//               Asignar
//               {/* {(total * Number(activeRadioTip)) / 100} */}
//             </Button>
//           </div>
//         </SubModal>
//       )}

//       <input
//         type="hidden"
//         name="paymentMethod"
//         value={activeRadioPaymentMethod}
//       />
//       <input type="hidden" name="tipPercentage" value={activeRadioTip} />
//     </>
//   )
// }

// export function PaymentContainer({currency, amountLeft, total, children}) {
//   return (
//     <>
//       <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-4 bg-day-bg_principal px-3">
//         <Spacer spaceY="2" />
//         <FlexRow justify="between">
//           <H5>Queda por pagar:</H5>
//           <H3>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H3>
//         </FlexRow>
//         <Spacer spaceY="1" />
//         {children}
//       </div>
//     </>
//   )
// }

export function Payment({
  currency,
  tipsPercentages,
  paymentMethods,
  amountLeft,
  amountToPayState,
}: {
  currency: string
  tipsPercentages: any
  paymentMethods: any
  amountLeft: number | undefined
  amountToPayState: number
}) {
  // const matches = useMatchesData(params.)
  // const matches = useMatches() as any

  // const matchData = matches.find(
  //   match => match.id === 'routes/table.$tableId',
  // ).data

  const navigation = useNavigation()

  const [tipRadio, setTipRadio] = React.useState(12)
  const [paymentRadio, setPaymentRadio] = React.useState('cash')
  const [showModal, setShowModal] = React.useState({
    tip: false,
    payment: false,
  })

  const handleTipChange = e => {
    setTipRadio(Number(e.target.value))
  }
  const handleMethodChange = e => {
    setPaymentRadio(e.target.value)
  }

  const tip = Number(amountToPayState) * (Number(tipRadio) / 100)
  const total = Number(amountToPayState) + tip

  const isSubmitting = navigation.state !== 'idle'

  // const tipPercentages = tipsPercentages.map(tipsPercentages => tipsPercentages)

  const showPayContent = total > 0

  return (
    <>
      <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-2 border-button-textNotSelected border-opacity-70 bg-day-bg_principal px-3">
        <Spacer spaceY="2" />
        <FlexRow justify="between" className={clsx({ 'py-2': !showPayContent })}>
          {showPayContent ? <H5>Queda por pagar en la mesa:</H5> : <H3>Queda por pagar:</H3>}
          {showPayContent ? (
            <H3>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H3>
          ) : (
            <H2>{formatCurrency(currency, amountLeft ? amountLeft : total)}</H2>
          )}
        </FlexRow>
        <Spacer spaceY="1" />
        <AnimatePresence initial={false}>
          {showPayContent && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate={showPayContent ? 'visible' : 'hidden'}
              exit="hidden"
              className="flex flex-col"
            >
              <hr />
              <Spacer spaceY="2" />
              <button
                className="flex flex-row items-center justify-between"
                type="button"
                onClick={() => setShowModal({ ...showModal, tip: true })}
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
                onClick={() => setShowModal({ ...showModal, payment: true })}
              >
                <H5>Método de pago</H5>
                <FlexRow>
                  <H3>{Translate('es', paymentRadio)}</H3>
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
              <Spacer spaceY="1" />
              <hr />
              <Spacer spaceY="1" />
              <FlexRow justify="between">
                <H5>Vas a pagar:</H5>
                <div className="flex flex-col">
                  <H2>{formatCurrency(currency, total ? total : 0)}</H2>
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
          tipPercentages={tipsPercentages}
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

export function AssignTipModal({ showModal, setShowModal, tipPercentages, tipRadio, currency, amountToPay, handleTipChange }) {
  return (
    <SubModal onClose={() => setShowModal({ ...showModal, tip: false })} title="Asignar propina">
      <div className="space-y-2">
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
              <H2>{tipPercentage}%</H2>
              <H5>{formatCurrency(currency, Number(amountToPay) * (Number(tipPercentage) / 100))}</H5>
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
      </div>
      <Spacer spaceY="2" />
      <Button fullWith={true} onClick={() => setShowModal({ ...showModal, tip: false })}>
        Asignar
      </Button>
    </SubModal>
  )
}

export function AssignPaymentMethodModal({ showModal, setShowModal, paymentMethods, paymentRadio, handleMethodChange }) {
  return (
    <SubModal onClose={() => setShowModal({ ...showModal, payment: false })} title="Asignar método de pago">
      <div className="space-y-2">
        {paymentMethods.paymentMethods.map((paymentMethod: any) => {
          const translate = Translate('es', paymentMethod)

          return (
            <label
              key={paymentMethod}
              className={clsx(
                'flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
                {
                  'text-2 rounded-full bg-button-primary px-2 py-3  text-white  ring-4   ring-button-outline':
                    paymentRadio === paymentMethod,
                },
              )}
            >
              {translate}
              <input
                type="radio"
                name="paymentMethod"
                // defaultChecked={paymentMethod === 'cash'}
                value={paymentMethod}
                onChange={handleMethodChange}
                className="sr-only"
              />
            </label>
          )
        })}
        <Button fullWith={true} onClick={() => setShowModal({ ...showModal, payment: false })}>
          Asignar
        </Button>
      </div>
    </SubModal>
  )
}
