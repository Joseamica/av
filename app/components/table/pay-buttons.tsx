import { useState } from 'react'
import { FaDivide, FaExchangeAlt, FaList } from 'react-icons/fa'

import { EditIcon, OutlineUsersIcon, UsersIcon } from '../icons'
import { Button, LinkButton } from '../ui/buttons/button'
// * UTILS
import { Spacer } from '../util/spacer'

// * CUSTOM COMPONENTS
import { Modal as ModalPortal } from '~/components/modals'

export function PayButtons({ setShowPaymentOptions }: { setShowPaymentOptions?: (value: boolean) => void }) {
  const [showSplit, setShowSplit] = useState(false)

  const handleFullPay = () => {
    if (setShowPaymentOptions) setShowPaymentOptions(false)
  }

  const handleSplitPay = () => {
    if (setShowPaymentOptions) {
      setShowSplit(false)
      setShowPaymentOptions(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Button
        onClick={() => {
          setShowSplit(true)
        }}
        variant="primary"
        size="large"
      >
        Dividir cuenta
      </Button>
      <Spacer spaceY="1" />
      <LinkButton to="pay/full-bill" onClick={handleFullPay}>
        Pagar la cuenta completa
      </LinkButton>
      <Spacer spaceY="2" />
      <ModalPortal isOpen={showSplit} handleClose={() => setShowSplit(false)} title="Dividir cuenta">
        <div className="flex flex-col space-y-2 bg-white p-2">
          <LinkButton to="pay/perDish" onClick={handleSplitPay}>
            <div className="flex justify-between  w-full items-center">
              <span className="">
                <FaList />
              </span>
              <span className="text-base"> Pagar por articulo</span>
              <span />
            </div>
          </LinkButton>
          <LinkButton to="pay/perPerson" onClick={handleSplitPay}>
            <div className="flex justify-between  w-full items-center">
              <span className="">
                <OutlineUsersIcon />
              </span>
              <span className="text-base"> Pagar por alguien mas</span>
              <span />
            </div>
          </LinkButton>
          <LinkButton to="pay/equal-parts" onClick={handleSplitPay}>
            <div className="flex justify-between  w-full items-center">
              <span className="">
                <FaExchangeAlt />
              </span>
              <span className="text-base"> Dividir la cuenta en partes iguales</span>
              <span />
            </div>
          </LinkButton>
          <LinkButton to="pay/custom" onClick={handleSplitPay}>
            <div className="flex justify-between  w-full">
              <span>
                <EditIcon />
              </span>
              <span className="text-base">Cantidad personalizada</span>
              <span />
            </div>
          </LinkButton>
        </div>
      </ModalPortal>
    </div>
  )
}
