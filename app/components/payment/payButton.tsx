import { ChevronRightIcon, ChevronUpIcon } from '../icons'
import { FlexRow } from '../util/flexrow'
import { H3, H5, H6 } from '../util/typography'
import { usePayment } from './paymentV3'

import { Translate } from '~/utils'

export function PayButton() {
  const { paymentRadio, showModal, setShowModal } = usePayment()

  return (
    <button className="flex flex-row items-center justify-between" type="button" onClick={currentState => setShowModal({ ...currentState, payment: true })}>
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
  )
}
