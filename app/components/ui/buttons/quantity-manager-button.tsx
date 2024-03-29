type QuantityManagerProps = {
  tableNumber?: number;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  disabledPlus?: boolean;
  payingFor?: number;
  activate?: boolean;
  setPayingFor?: React.Dispatch<React.SetStateAction<number>>;
  disableSub?: boolean;
};

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
      setPayingFor(payingFor - 1);
      setQuantity(quantity - 1);
    } else {
      setQuantity(quantity - 1);
    }
  };
  return (
    <div className="flex items-center justify-center rounded-full p-1 dark:bg-button-primary">
      <button
        type="button"
        className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal h-10 w-10 rounded-full bg-day-bg_principal shadow-lg disabled:text-gray-300 xs:h-7 xs:w-7"
        onClick={handler}
        disabled={quantity <= 1 || activate === false || disableSub}
      >
        -
      </button>
      <span className="px-3 py-2  text-white disabled:text-gray-200 xs:px-2 xs:py-1 xs:text-xs">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal h-10 w-10 rounded-full bg-day-bg_principal shadow-lg xs:h-7 xs:w-7"
        disabled={disabledPlus}
      >
        +
      </button>
    </div>
  );
};
