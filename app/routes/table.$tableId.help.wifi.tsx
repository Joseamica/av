import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { FlexRow, H2, H6, Modal } from "~/components";
import { prisma } from "~/db.server";
import { getBranchId } from "~/models/branch.server";

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params;
  invariant(tableId, "tableId is required");
  const branchId = await getBranchId(tableId);
  const wifiDetails = await prisma.branch.findFirst({
    where: { id: branchId },
    select: { wifiName: true, wifipwd: true },
  });

  return json({ wifiDetails });
}

export default function Help() {
  const data = useLoaderData();
  const navigate = useNavigate();

  const onClose = () => {
    navigate("..");
  };

  return (
    <Modal title="Wifi" onClose={onClose}>
      <div className="text js-copy-to-clip flex flex-col space-y-4 p-5 text-xl">
        <div className="flex flex-col items-center justify-between space-y-1">
          <H6>Nombre de red:</H6>
          <H2>{data.wifiDetails.wifiName}</H2>
        </div>
        <div className="flex flex-col items-center justify-between space-y-1 ">
          <H6>Clave:</H6>
          <FlexRow className="items-center space-x-2">
            <H2>{data.wifiDetails.wifipwd}</H2>
            <button
              onClick={() =>
                navigator.clipboard.writeText(data.wifiDetails.wifipwd)
              }
              className="bg-principal flex flex-row items-center space-x-2 rounded-full border-button-outline px-2 py-1 text-sm text-white dark:bg-button-primary"
            >
              Copiar
            </button>
          </FlexRow>
        </div>
      </div>
    </Modal>
  );
}
