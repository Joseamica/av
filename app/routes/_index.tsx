import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { getSession } from "~/session.server";

// TODO  Move this logic ._.)/
export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request);
  const sessionTableId = session.get("tableId") || null;

  // if (sessionTableId) {
  //   return redirect(`/table/${sessionTableId}`);
  // } else {
  //   throw new Error("Escanea un codigo QR or entra el link de la mesa");
  // }

  return json({ success: true });
}

export default function _index() {
  return <div>No deberias de estar Aqui!</div>;
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}
