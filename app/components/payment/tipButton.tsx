import { ChevronRightIcon, ChevronUpIcon } from '../icons'
import { FlexRow } from '../util/flexrow'
import { H3, H4, H5, H6 } from '../util/typography'
import { usePayment } from './paymentV3'

import { formatCurrency } from '~/utils'

function TipButton() {
  const { setShowModal, tipRadio, currency, tip, showModalTip } = usePayment()

  const handleModal = () => {
    setShowModal(currentState => ({ ...currentState, tip: true }))
  }

  return (
    <>
      <button className="flex flex-row items-center justify-between" type="button" onClick={handleModal}>
        <H5>Propina</H5>
        <FlexRow>
          <FlexRow>
            <H4 variant="secondary">{tipRadio}%</H4>
            <H3>{formatCurrency(currency, tip)}</H3>
          </FlexRow>
          {showModalTip ? (
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

      <input type="hidden" name="tipPercentage" value={tipRadio} />
    </>
  )
}

export default TipButton
