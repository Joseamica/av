import { FaApplePay, FaCashRegister, FaCreditCard, FaGoogle, FaGooglePay, FaMoneyBillWave, FaStripe, FaTerminal } from 'react-icons/fa'
import { IoCard } from 'react-icons/io5'

import clsx from 'clsx'

import { CashIcon } from '../icons'
import { SubModal } from '../modal'
import { Button } from '../ui/buttons/button'
import { FlexRow } from '../util/flexrow'
import { usePayment } from './paymentV3'

import { Translate } from '~/utils'

export function PayModal() {
  const { setShowModal, paymentMethods, paymentRadio, handleMethodChange } = usePayment()

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
                  ' cursor-pointer flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-3  text-white  ring-4   ring-button-outline':
                      paymentRadio === paymentMethod,
                  },
                )}
              >
                {translate.includes('Tarjeta') ? (
                  <FaStripe className="self-start h-9 w-9" />
                ) : translate.includes('Efectivo') ? (
                  <CashIcon className="self-start h-7 w-7" />
                ) : translate.includes('terminal') ? (
                  <FaCreditCard className="self-start h-5 w-5" />
                ) : null}
                <span> {translate}</span>
                <span>
                  {translate.includes('Tarjeta') ? (
                    <FlexRow>
                      <FaGooglePay className="h-9 w-9" />
                      <FaApplePay className="h-9 w-9" />
                    </FlexRow>
                  ) : null}
                </span>

                <input
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

        <Button fullWith={true} onClick={() => setShowModal(currentState => ({ ...currentState, payment: false }))}>
          Asignar
        </Button>
      </div>
    </SubModal>
  )
}
