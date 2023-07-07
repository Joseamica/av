import { useState } from "react";
// * UTILS
import { Spacer } from "../util/spacer";
// * CUSTOM COMPONENTS
import { Modal as ModalPortal } from "~/components/modals";
import { Button, LinkButton } from "../ui/buttons/button";

export function PayButtons({
  setShowPaymentOptions,
}: {
  setShowPaymentOptions?: (value: boolean) => void;
}) {
  const [showSplit, setShowSplit] = useState(false);

  const handleFullPay = () => {
    if (setShowPaymentOptions) setShowPaymentOptions(false);
  };

  const handleSplitPay = () => {
    if (setShowPaymentOptions) {
      setShowSplit(false);
      setShowPaymentOptions(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Button
        onClick={() => {
          setShowSplit(true);
        }}
        variant="primary"
        size="large"
      >
        Dividir cuenta
      </Button>
      <Spacer spaceY="1" />
      <LinkButton to="pay/fullpay" onClick={handleFullPay}>
        Pagar la cuenta completa
      </LinkButton>
      <Spacer spaceY="2" />
      <ModalPortal
        isOpen={showSplit}
        handleClose={() => setShowSplit(false)}
        title="Dividir cuenta"
      >
        <div className="flex flex-col space-y-2 bg-white p-2">
          <LinkButton to="pay/perDish" onClick={handleSplitPay}>
            Pagar por platillo
          </LinkButton>
          <LinkButton to="pay/perPerson" onClick={handleSplitPay}>
            Pagar por usuario
          </LinkButton>
          <LinkButton to="pay/equalParts" onClick={handleSplitPay}>
            Pagar en partes iguales
          </LinkButton>
          <LinkButton to="pay/custom" onClick={handleSplitPay}>
            Pagar monto personalizado
          </LinkButton>
        </div>
      </ModalPortal>
    </div>
  );
}
