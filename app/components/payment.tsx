import clsx from 'clsx'
import {Button} from './buttons/button'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H1, H2, H3} from './util/typography'
import React from 'react'
import {RadioInputButton} from './buttons/input'

export function Payment({
  total = 0,
  tip = total * (15 / 100),
  tipsPercentages,
  paymentMethods,
}: {
  total: number
  tip: number
  tipsPercentages: number[]
  paymentMethods: string[]
}) {
  const [activeRadioPaymentMethod, setActiveRadioPaymentMethod] =
    React.useState<string>('cash')
  const handleChangePaymentMethod = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setActiveRadioPaymentMethod(event.target.value)
  }

  const [activeRadioTip, setActiveRadioTip] = React.useState<string>('12')
  const handleChangeTip = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRadioTip(event.target.value)
  }

  return (
    <div>
      {/* Radio Tip buttons */}
      <H1>Método de pago</H1>
      <FlexRow>
        {Object.values(paymentMethods).map(paymentMethod => (
          <RadioInputButton
            key={paymentMethod}
            title={`${paymentMethod}`}
            state={activeRadioPaymentMethod}
            id={`${paymentMethod}`}
            type="radio"
            name="paymentMethod"
            value={`${paymentMethod}`}
            className="sr-only"
            handlerFunction={handleChangePaymentMethod}
          />
        ))}
      </FlexRow>
      <Spacer spaceY="2" />
      <H2>Deseas dejar propina</H2>
      <FlexRow>
        {Object.values(tipsPercentages).map(tipPercentage => (
          <RadioInputButton
            key={tipPercentage}
            title={`${tipPercentage}%`}
            state={activeRadioTip}
            id={`${tipPercentage}`}
            type="radio"
            name="tipPercentage"
            value={`${tipPercentage}`}
            className="sr-only"
            handlerFunction={handleChangeTip}
          />
        ))}
      </FlexRow>
      <Spacer spaceY="2" />
      {/* Total, propina, total */}
      <div>
        <H1>Total: ${Number(total).toFixed(1)}</H1>
        <H1>Propina: ${Number(tip).toFixed(1)}</H1>
      </div>
      <Button name="_action" value="proceed">
        Submit
      </Button>
    </div>
  )
}
