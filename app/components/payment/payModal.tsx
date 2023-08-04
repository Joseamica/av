import clsx from 'clsx'

import { SubModal } from '../modal'
import { Button } from '../ui/buttons/button'
import { usePayment } from './paymentV3'

import { Translate } from '~/utils'

export function PayModal() {
  const { setShowModal, paymentMethods, paymentRadio, handleMethodChange } = usePayment()

  return (
    <SubModal onClose={() => setShowModal(currentState => ({ ...currentState, payment: false }))} title="Asignar método de pago">
      <div className="space-y-2">
        {paymentMethods.paymentMethods.map((paymentMethod: any) => {
          const translate = Translate('es', paymentMethod)

          return (
            <label
              key={paymentMethod}
              className={clsx(
                ' cursor-pointer flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg',
                {
                  'text-2 rounded-full bg-button-primary px-2 py-3  text-white  ring-4   ring-button-outline': paymentRadio === paymentMethod,
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
        <Button fullWith={true} onClick={() => setShowModal(currentState => ({ ...currentState, payment: false }))}>
          Asignar
        </Button>
      </div>
    </SubModal>
  )
}
