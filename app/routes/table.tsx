import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "@remix-run/react";
// * UTILS, DB, EVENTS
import { EVENTS } from "~/events";
import { getTableIdFromUrl } from "~/utils";
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from "~/session.server";
import { findOrCreateUser } from "~/models/user.server";
import { prisma } from "~/db.server";
import { validateRedirect } from "~/redirect.server";
// * COMPONENTS
import { addHours, formatISO } from "date-fns";
// * CUSTOM COMPONENTS
import { Header, UserForm } from "~/components";

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;

export default function TableLayoutPath() {
  const data = useLoaderData();

  if (!data.username) {
    return <UserForm />;
  }

  return (
    <>
      <Header user={data.user} isAdmin={data.isAdmin} />
      <Outlet></Outlet>
    </>
  );
}

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");
  const username = session.get("username");
  let user = null;

  //ADMIN PURPOSES
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "admin",
    },
  });

  // * Verify if user is on the database or create
  if (username) {
    user = await findOrCreateUser(userId, username);
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  const tableId = getTableIdFromUrl(pathname);

  if (!tableId) {
    throw new Error(
      "Procura acceder por medio del código QR, u obtener el link con el id de la mesa."
    );
  }

  return json(
    { username, pathname, user, isAdmin },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
  );
};

export const action = async ({ request, params }: ActionArgs) => {
  let [body, session] = await Promise.all([
    request.text(),
    getSession(request),
  ]);
  let formData = new URLSearchParams(body);

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const url = formData.get("url") as string;
  const proceed = formData.get("_action") === "proceed";

  let redirectTo = validateRedirect(formData.get("redirect"), url);
  const tableId = getTableIdFromUrl(url);

  const userId = session.get("userId");
  const searchParams = new URLSearchParams(request.url);

  if (!name) {
    return redirect(redirectTo + "?error=Debes ingresar un nombre...");
  }

  if (name && proceed) {
    console.time(`✅ Creating session and user with name... ${name}`);
    searchParams.set("error", "");
    const sessionId = await prisma.session.create({
      data: {
        expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
        user: {
          create: {
            id: userId,
            name: name,
            color: color ? color : "#000000",
            tables: tableId ? { connect: { id: tableId } } : {},
          },
        },
      },
      // select: {id: !0, expirationDate: !0},
    });
    console.log("✅Connected user to table");

    session.set("sessionId", sessionId.id);

    // Set expiry time 4 hours from now
    // const expiryTime = formatISO(addHours(new Date(), 4))
    // session.set('expiryTime', expiryTime)
    if (tableId) {
      console.log(
        "\x1b[42m%s\x1b[0m",
        "table.tsx line:115 SSE TRIGGER because tableId exists and user entered name"
      );
      EVENTS.ISSUE_CHANGED(tableId);
      session.set("tableId", tableId);
    }
    session.set("username", name);
    session.set("user_color", color);
    // session.set('tutorial', true)
    console.timeEnd(`✅ Creating session and user with name... ${name}`);

    return redirect(redirectTo, {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  return null;
};

// TEST ERROR BONDARY
export const ErrorBoundary = () => {
  const error = useRouteError() as Error;

  if (isRouteErrorResponse(error)) {
    return (
      <main className="bg-night-600">
        <p>No information</p>
        <p>Status: {error.status}</p>
        <p>{error?.data.message}</p>
      </main>
    );
  }

  return (
    <main className="bg-night-500 text-white">
      <h1>Rayos y centellas!</h1>
      <p>{error?.message}</p>
      <button className="bg-warning text-white">
        Back to <Link to={"/table"}> safety! </Link>
      </button>
    </main>
  );
};
