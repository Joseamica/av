import * as React from 'react'

import { PayButton } from './payButton'
import { PayModal } from './payModal'
import { PayTotal } from './payTotal'
import { PaymentForm } from './paymentForm'
import { TipButton } from './tipButton'
import { TipModal } from './tipModal'

const PaymentContext = React.createContext(null)

function Payment({
  children,
  state,
}: {
  children: any
  state: {
    amountLeft: number
    amountToPayState: number
    currency: string
    paymentMethods: string[]
    tipsPercentages: string[]
  }
}) {
  const [showModal, setShowModal] = React.useState({
    tip: false,
    payment: false,
  })
  const [paymentRadio, setPaymentRadio] = React.useState('card')
  const [tipRadio, setTipRadio] = React.useState(15)
  const tip = Number(state.amountToPayState) * (Number(tipRadio) / 100)
  const subtotal = Number(state.amountToPayState) + tip

  const avoqadoFee = subtotal * 0.02

  const total = subtotal + avoqadoFee

  const handleMethodChange = e => {
    setPaymentRadio(e.target.value)
  }

  const value = { ...state, tipRadio, setTipRadio, tip, total, showModal, setShowModal, paymentRadio, handleMethodChange }

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
}

export function usePayment() {
  const context = React.useContext(PaymentContext)
  if (!context) {
    throw new Error(`Toggle compound components cannot be rendered outside the Toggle component`)
  }
  return context
}

Payment.TipButton = TipButton
Payment.Form = PaymentForm
Payment.TipModal = TipModal
Payment.PayModal = PayModal
Payment.PayButton = PayButton
Payment.PayTotal = PayTotal

export default Payment
