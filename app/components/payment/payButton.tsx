import { ChevronRightIcon } from '../icons'
import { FlexRow } from '../util/flexrow'
import { H4, H5 } from '../util/typography'
import { usePayment } from './paymentV3'

import { Translate } from '~/utils'

export function PayButton() {
  const { paymentRadio, showModal, setShowModal } = usePayment()

  return (
    <button
      className="flex flex-row items-center justify-between"
      type="button"
      onClick={currentState => setShowModal({ ...currentState, payment: true })}
    >
      <H5>Método de pago</H5>
      <FlexRow className="border rounded-full pl-3 bg-[#F7FAFC]">
        <H4 className=" decoration-slate-600">{Translate('es', paymentRadio)}</H4>
        <FlexRow className="rounded-full bg-day-principal px-2 py-1 text-white">
          {/* <H4>Cambiar</H4> */}
          <ChevronRightIcon className="h-4 w-4" />
        </FlexRow>
      </FlexRow>
    </button>
  )
}
