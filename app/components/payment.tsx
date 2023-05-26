import clsx from 'clsx'
import {Button} from './buttons/button'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H1, H2, H3, H4, H5} from './util/typography'
import React from 'react'
import {RadioInputButton} from './buttons/input'
import {formatCurrency} from '~/utils'
import {useActionData, useLoaderData} from '@remix-run/react'

export function Payment({
  total = 0,
  tip,
  tipsPercentages,
  paymentMethods,
  currency,
  error,
}: {
  total: number
  tip: number
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
  error?: string
}) {
  const data = useLoaderData()
  // console.log('data', data)
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
    <div className="sticky inset-x-0 bottom-0 flex flex-col justify-center rounded-t-xl border-2 bg-white px-2">
      {/* Radio Tip buttons */}
      <Spacer spaceY="2" />
      <H2>Método de pago</H2>
      <Spacer spaceY="2" />
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
      <Spacer spaceY="2" />
      <FlexRow className="space-x-4">
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
        <FlexRow justify="between">
          <H4>Total: </H4>
          <H2 boldVariant="semibold">{formatCurrency(currency, total)}</H2>
        </FlexRow>
        <FlexRow justify="between">
          <H4>Propina:</H4>
          <H2 boldVariant="semibold">
            {formatCurrency(currency, tip ? tip : Number(total) * 0.12)}
          </H2>
        </FlexRow>
      </div>
      <H5 boldVariant="semibold" variant="error">
        {error}
      </H5>

      <Button name="_action" value="proceed">
        Submit
      </Button>
    </div>
  )
}
