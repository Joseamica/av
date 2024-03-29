import { FaApplePay, FaCashRegister, FaCreditCard, FaGoogle, FaGooglePay, FaMoneyBillWave, FaStripe, FaTerminal } from 'react-icons/fa'
import { IoCard, IoCardOutline, IoCash, IoCashOutline } from 'react-icons/io5'

import clsx from 'clsx'

import { CashIcon } from '../icons'
import { SubModal } from '../modal'
import { Button } from '../ui/buttons/button'
import { FlexRow } from '../util/flexrow'
import { H5 } from '../util/typography'
import { usePayment } from './paymentV3'

import { Translate } from '~/utils'

export function PayModal() {
  const { setShowModal, paymentMethods, paymentRadio, handleMethodChange, isPendingPayment } = usePayment()

  return (
    <SubModal onClose={() => setShowModal(currentState => ({ ...currentState, payment: false }))} title="Asignar método de pago">
      <div className="space-y-4">
        {paymentMethods.paymentMethods.map((paymentMethod: any) => {
          const translate = Translate('es', paymentMethod)

          return (
            <div key={paymentMethod}>
              <label
                key={paymentMethod}
                className={clsx(
                  ' cursor-pointer flex w-full flex-row items-center justify-between space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-3  text-white  ring-4   ring-button-outline':
                      paymentRadio === paymentMethod,
                  },
                )}
              >
                <div>
                  {translate}{' '}
                  {isPendingPayment && translate !== 'Tarjeta' ? (
                    <span className="text-xs border rounded-full px-2">Pago restringido</span>
                  ) : null}
                </div>
                <div className="w-28 flex justify-end">
                  {translate.includes('Tarjeta') ? (
                    <>
                      <FlexRow>
                        <FaStripe className="self-start h-9 w-9" />
                        <FaGooglePay className="h-9 w-9" />
                        <FaApplePay className="h-9 w-9" />
                      </FlexRow>
                    </>
                  ) : translate.includes('Efectivo') ? (
                    <IoCashOutline className=" h-7 w-7" />
                  ) : translate.includes('Terminal') ? (
                    <IoCardOutline className="h-7 w-7" />
                  ) : null}
                </div>

                <input
                  disabled={(isPendingPayment && paymentMethod === 'cash') || paymentMethod === 'terminal'}
                  type="radio"
                  name="paymentMethod"
                  // defaultChecked={paymentMethod === 'cash'}
                  value={paymentMethod}
                  onChange={handleMethodChange}
                  className="sr-only"
                />
              </label>
            </div>
          )
        })}
        {isPendingPayment && (
          <div className="w-full flex justify-center text-center">
            <H5 variant="secondary">
              Pago en efectivo y terminal esta restringido, llama a tu mesero para que te cobre lo que solicitaste.
            </H5>
          </div>
        )}
        <Button fullWith={true} onClick={() => setShowModal(currentState => ({ ...currentState, payment: false }))}>
          Asignar
        </Button>
      </div>
    </SubModal>
  )
}
