import { useLocation } from '@remix-run/react'

import { ChevronRightIcon } from '../icons'
import { FlexRow } from '../util/flexrow'
import { H4, H5 } from '../util/typography'
import { usePayment } from './paymentV3'

import { formatCurrency } from '~/utils'

function TipButton() {
  const { setShowModal, tipRadio, currency, tip } = usePayment()

  const handleModal = () => {
    setShowModal(currentState => ({ ...currentState, tip: true }))
  }

  return (
    <>
      <button className="flex flex-row items-center justify-between " type="button" onClick={handleModal}>
        <H5>Propina</H5>

        <FlexRow className="border rounded-full pl-3 bg-[#F7FAFC]">
          <H5 variant="secondary">{tipRadio}%</H5>
          <H4>{formatCurrency(currency, tip)}</H4>
          <FlexRow className="rounded-full bg-day-principal text-white px-2 py-1">
            {/* <H4>Cambiar</H4> */}
            <ChevronRightIcon className="h-4 w-4" />
          </FlexRow>
        </FlexRow>
      </button>

      <input type="hidden" name="tipPercentage" value={tipRadio} />
    </>
  )
}

export { TipButton }
