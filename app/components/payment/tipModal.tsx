import { useState } from 'react'

import clsx from 'clsx'

import { SubModal } from '../modal'
import { Button } from '../ui/buttons/button'
import { FlexRow } from '../util/flexrow'
import { Spacer } from '../util/spacer'
import { H3, H4 } from '../util/typography'
import { usePayment } from './paymentV3'

import { formatCurrency } from '~/utils'

function TipModal() {
  const { setShowModal, setTipRadio, tipRadio, currency, tipsPercentages, tip } = usePayment()

  const handleModal = () => {
    setShowModal(currentState => ({ ...currentState, tip: false }))
  }

  const handleTipChange = e => {
    setTipRadio(Number(e.target.value))
  }

  const [showEditTipModal, setShowEditTipModal] = useState(false)

  return (
    <>
      <SubModal onClose={handleModal} title="Asignar propina">
        <div className="flex flex-col space-y-3 h-full">
          {tipsPercentages &&
            tipsPercentages.map((tipPercentage: any) => (
              <label
                key={tipPercentage}
                className={clsx(
                  'flex w-full flex-row items-center justify-center space-x-2 rounded-full border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
                  {
                    'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                      tipRadio.toString() === tipPercentage,
                  },
                )}
              >
                <FlexRow justify="between" className="w-full">
                  <H4>
                    {tipPercentage >= 10 && tipPercentage < 12
                      ? '😘 Muchas gracias!'
                      : tipPercentage >= 12 && tipPercentage < 15
                      ? '🥰 Excelente servicio!'
                      : tipPercentage >= 15 && tipPercentage < 18
                      ? '❤️ Wow!'
                      : tipPercentage >= 18
                      ? '😱 Me alegraste el día'
                      : tipPercentage === '0'
                      ? 'No dejar propina'
                      : 'otro'}
                  </H4>
                  <H3>{tipPercentage}%</H3>
                </FlexRow>
                <input type="radio" name="tipPercentage" value={tipPercentage} onChange={handleTipChange} className="sr-only" />
              </label>
            ))}
          <div>
            <button
              type="button"
              className={clsx(
                'flex w-full flex-row items-center justify-center space-x-2 rounded-full border border-button-outline border-opacity-40 px-3 py-1 text-center shadow-lg',
                {
                  'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
                    tipRadio.toString() !== '0' && !tipsPercentages.includes(tipRadio.toString()),
                },
              )}
              onClick={() => setShowEditTipModal(true)}
            >
              <FlexRow justify="between" className="w-full">
                <H4>✍️ Otro</H4>
                <H3>{!tipsPercentages.includes(tipRadio.toString()) ? tipRadio.toString() + '%' : 'Editar'}</H3>
              </FlexRow>
            </button>
          </div>
        </div>
        {/* <Spacer spaceY="2" />
        <div className="cursor-pointer flex w-full flex-row items-center justify-center space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-2 shadow-lg">
          <span>Otro</span>
          <input type="text" onChange={handleTipChange} />
        </div> */}
        <Spacer spaceY="4" />
        <H3 className="flex w-full flex-row justify-center">Tu propina: {formatCurrency(currency, tip)}</H3>
        <Spacer spaceY="2" />
        <Button fullWith={true} onClick={handleModal} className="sticky bottom-0">
          Asignar
        </Button>
      </SubModal>
      {showEditTipModal && (
        <SubModal onClose={() => setShowEditTipModal(false)} title="">
          <div className="flex flex-row  w-full px-4 py-2 bg-componentBg dark:bg-DARK_0  items-center">
            <input
              type="number"
              name="tipPercentage"
              min="10"
              max={100}
              id="custom"
              inputMode="decimal"
              onChange={e => setTipRadio(e.target.value)}
              className={clsx(
                `dark:bg-DARK-0 flex h-20 w-full bg-[#F9f9f9] text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 text-right`,
              )}
              placeholder={tipRadio}
            />
            <label htmlFor="custom" className={clsx('bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]')}>
              %
            </label>
          </div>

          <Spacer spaceY="4" />
          <H3 className="flex w-full flex-row justify-center">Propina que deseas dejar: {formatCurrency(currency, tip)}</H3>
          <Spacer spaceY="4" />

          <Button size="medium" fullWith={true} onClick={() => setShowEditTipModal(false)}>
            Asignar
          </Button>
        </SubModal>
      )}
    </>
  )
}

export { TipModal }
