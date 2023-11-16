import { Button } from '../ui/buttons/button'
import { PayButtons } from './pay-buttons'

import { Modal as ModalPortal } from '~/components/modals'

export function SinglePayButton({
  showPaymentOptions,
  setShowPaymentOptions,
}: {
  showPaymentOptions: boolean
  setShowPaymentOptions: (value: boolean) => void
}) {
  return (
    <div className="sticky bottom-5">
      <Button size="medium" variant="primary" fullWith={true} className="sticky" onClick={() => setShowPaymentOptions(true)}>
        <span className="font-bold"> Pagar o dividir la cuenta</span>
      </Button>
      <ModalPortal title="Pagar o dividir la cuenta" isOpen={showPaymentOptions} handleClose={() => setShowPaymentOptions(false)}>
        <div className="bg-white px-2 pt-4">
          <PayButtons setShowPaymentOptions={setShowPaymentOptions} />
        </div>
      </ModalPortal>
    </div>
  )
}
