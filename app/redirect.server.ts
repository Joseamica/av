export function validateRedirect(
  redirect: string | null | undefined,
  defaultRedirect: string
) {
  if (redirect?.startsWith("/") && redirect[1] !== "/") {
    return redirect;
  }

  return defaultRedirect;
}
