import { Button } from "../ui/buttons/button";
import { Modal as ModalPortal } from "~/components/modals";
import { PayButtons } from "./pay-buttons";

export function SinglePayButton({
  showPaymentOptions,
  setShowPaymentOptions,
}: {
  showPaymentOptions: boolean;
  setShowPaymentOptions: (value: boolean) => void;
}) {
  return (
    <div className="sticky bottom-2">
      <Button
        size="medium"
        variant="primary"
        fullWith={true}
        className="sticky"
        onClick={() => setShowPaymentOptions(true)}
      >
        Pagar o dividir la cuenta
      </Button>
      <ModalPortal
        title="Pagar o dividir la cuenta"
        isOpen={showPaymentOptions}
        handleClose={() => setShowPaymentOptions(false)}
      >
        <div className="bg-white px-2 pt-4">
          <PayButtons setShowPaymentOptions={setShowPaymentOptions} />
        </div>
      </ModalPortal>
    </div>
  );
}
