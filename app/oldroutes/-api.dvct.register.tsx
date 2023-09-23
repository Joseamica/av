import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  const rawData = await request.text();
  const data = JSON.parse(rawData);

  return json({ success: true });
};
