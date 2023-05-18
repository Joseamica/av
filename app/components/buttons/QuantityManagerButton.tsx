type QuantityManagerProps = {
  tableNumber?: number
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  disabledPlus?: boolean
  payingFor?: number
  activate?: boolean
  setPayingFor?: React.Dispatch<React.SetStateAction<number>>
  disableSub?: boolean
}

export const QuantityManagerButton = ({
  quantity,
  setQuantity,
  disabledPlus,
  payingFor,
  activate,
  setPayingFor,
  disableSub,
}: QuantityManagerProps) => {
  const handler = () => {
    if (
      setPayingFor &&
      payingFor &&
      activate === true &&
      payingFor !== 0 &&
      quantity <= payingFor
    ) {
      setPayingFor(payingFor - 1)
      setQuantity(quantity - 1)
    } else {
      setQuantity(quantity - 1)
    }
  }
  return (
    <div className="flex items-center justify-center p-1 rounded-full bg-principal dark:bg-secondaryDark">
      <button
        className="w-10 h-10 bg-white rounded-full dark:bg-mainDark xs:w-7 xs:h-7 disabled:text-gray-300"
        onClick={handler}
        disabled={quantity <= 1 || activate === false || disableSub}
      >
        -
      </button>
      <span className="px-3 py-2 text-white xs:px-2 xs:py-1 xs:text-xs disabled:text-gray-200">
        {quantity}
      </span>
      <button
        onClick={() => setQuantity(quantity + 1)}
        className="w-10 h-10 bg-white rounded-full dark:bg-mainDark xs:w-7 xs:h-7"
        disabled={disabledPlus}
      >
        +
      </button>
    </div>
  )
}
