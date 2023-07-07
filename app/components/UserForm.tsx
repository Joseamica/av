import { useLoaderData, useSearchParams } from "@remix-run/react";
// * CUSTOM COMPONENTS
import { Modal } from "~/components/modals";
import { ContentForm } from "./ContentForm";

// ! TODO en donde se está utilzando?

export function UserForm() {
  const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  const errorClass = error ? "animate-pulse placeholder:text-warning" : "";

  return (
    <div className="hide-scrollbar no-scrollbar relative mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
      <div id="modal-root" />
      <Modal handleClose={() => null} title="Registro de usuario" isOpen={true}>
        <ContentForm
          errorClass={errorClass}
          error={error || ""}
          pathname={data.pathname}
        />
      </Modal>
    </div>
  );
}
