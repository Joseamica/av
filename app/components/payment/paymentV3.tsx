import { useLocation } from '@remix-run/react'
import * as React from 'react'

import { PayButton } from './payButton'
import { PayModal } from './payModal'
import { PayTotal } from './payTotal'
import { PaymentForm } from './paymentForm'
import { TipButton } from './tipButton'
import { TipModal } from './tipModal'

import { getAvoqadoFee } from '~/utils'

const PaymentContext = React.createContext(null)

function Payment({
  children,
  state,
}: {
  children: React.ReactNode
  state: {
    amountLeft: number
    amountToPayState: number
    currency: string
    paymentMethods: string[]
    tipsPercentages: string[]
    isPendingPayment?: boolean
  }
}) {
  const [showModal, setShowModal] = React.useState({
    tip: false,
    payment: false,
  })
  const [paymentRadio, setPaymentRadio] = React.useState('card')
  const handleMethodChange = e => {
    setPaymentRadio(e.target.value)
  }
  const [tipRadio, setTipRadio] = React.useState(15)
  const location = useLocation()
  const isFullBillRoute = location.pathname.includes('full-bill')

  let tip = 0
  let subtotal = 0
  let avoqadoFee = 0
  let total = 0

  if (isFullBillRoute) {
    tip = (Number(state.amountLeft) * Number(tipRadio)) / 100
    subtotal = Number(state.amountLeft) + tip
    avoqadoFee = getAvoqadoFee(subtotal, paymentRadio)
    total = state.amountLeft + avoqadoFee + tip
  } else {
    tip = (Number(state.amountToPayState) * Number(tipRadio)) / 100
    subtotal = Number(state.amountToPayState) + tip
    avoqadoFee = getAvoqadoFee(subtotal, paymentRadio)
    total = subtotal + avoqadoFee
  }

  const value = {
    ...state,
    tipRadio,
    setTipRadio,
    tip,
    total,
    showModal,
    setShowModal,
    paymentRadio,
    handleMethodChange,
    subtotal,
    avoqadoFee,
  }

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
