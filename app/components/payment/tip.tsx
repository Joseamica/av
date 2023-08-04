import React from 'react'

import clsx from 'clsx'

import { ChevronRightIcon, ChevronUpIcon } from '../icons'
import { SubModal } from '../modal'
import { Button } from '../ui/buttons/button'
import { FlexRow } from '../util/flexrow'
import { Spacer } from '../util/spacer'
import { H3, H4, H5, H6 } from '../util/typography'
import { Underline } from '../util/underline'

import { formatCurrency } from '~/utils'

function useTip({ currency, tip, tipRadio, tipsPercentages, total, handleTipChange }) {
  const [showModalTip, setShowModalTip] = React.useState(false)

  const handleModal = () => {
    setShowModalTip(currentState => !currentState)
  }

  const ButtonTip: React.FC = () => (
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

  const ModalTip: React.FC = () => (
    <>
      <SubModal onClose={handleModal} title="Asignar propina">
        <div className="flex flex-col space-y-2">
          {tipsPercentages &&
            tipsPercentages.map((tipPercentage: any) => (
              <label
                key={tipPercentage}
                className={clsx(
                  'flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline': tipRadio.toString() === tipPercentage,
                  },
                )}
              >
                <FlexRow justify="between" className="w-full">
                  <H4>
                    {tipPercentage >= 10 && tipPercentage < 12
                      ? 'Muchas gracias!'
                      : tipPercentage >= 12 && tipPercentage < 15
                      ? 'Excelente servicio!'
                      : tipPercentage >= 15 && tipPercentage < 18
                      ? '❤️ Wow!'
                      : tipPercentage >= 18
                      ? 'Eres increible!'
                      : tipPercentage === '0'
                      ? 'No dejar propina'
                      : 'otro'}
                  </H4>
                  <H3>{tipPercentage}%</H3>
                </FlexRow>
                <input type="radio" name="tipPercentage" value={tipPercentage} onChange={handleTipChange} className="sr-only" />
              </label>
            ))}
        </div>
        <Spacer spaceY="2" />
        <H3 className="flex w-full flex-row justify-center">
          <Underline>Estas dejando {formatCurrency(currency, (tipRadio * total) / 100)} de propina</Underline>
        </H3>
        <Spacer spaceY="2" />
        <Button fullWith={true} onClick={currentState => setShowModalTip(!currentState)}>
          Asignar
        </Button>
      </SubModal>
    </>
  )

  return { ButtonTip, ModalTip, showModalTip }
}

export default useTip
