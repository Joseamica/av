import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
// * UTILS, DB, EVENTS
import { prisma } from "~/db.server";
import { EVENTS } from "~/events";
import { findOrCreateUser } from "~/models/user.server";
import { validateRedirect } from "~/redirect.server";
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from "~/session.server";
import { getTableIdFromUrl } from "~/utils";
// * COMPONENTS
// * CUSTOM COMPONENTS
import { Header, UserForm } from "~/components";
import invariant from "tiny-invariant";

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; //30 days

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
  const sessionId = await getUserId(session);

  console.log("sessionId********", sessionId);

  // TODO esta linea evita entrar a las tablas cuando no tienese session
  /**
   * ! investigar el porque de esta logica y ver en donde la podemos implementar de forma correcta
   * ! Investigar porque es necesario un guest-${uuidv4()}
   */
  // if (!sessionId) {
  //   console.log("No sessionID ❌error expected");
  //   redirect("/logout");
  // }

  invariant(sessionId, "Session ID is required Error in table.tsx line 47");
  const userId = await getUserId(session);

  let user = null;

  //ADMIN PURPOSES
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "admin",
    },
  });
  const username = await getUsername(session);
  const user_color = session.get("user_color");

  // * Verify if user is on the database or create
  if (username) {
    user = await findOrCreateUser(userId, username, user_color);
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

  // const userId = session.get('userId')
  const searchParams = new URLSearchParams(request.url);

  if (!name) {
    return redirect(redirectTo + "?error=Debes ingresar un nombre...");
  }

  if (name && proceed) {
    console.time(`✅ Creating session and user with name... ${name}`);
    searchParams.set("error", "");
    const isOrderActive = await prisma.order.findFirst({
      where: { active: true, tableId: tableId },
    });

    const createdUser = await prisma.user.create({
      data: {
        name: name,
        color: color ? color : "#000000",
        tableId: tableId ? tableId : null,
        orderId: isOrderActive ? isOrderActive.id : null,
        sessions: {
          create: {
            expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
          },
        },
      },
      include: { sessions: true },
    });
    console.log(
      "\x1b[44m%s\x1b[0m",
      "table.tsx line:125 ✅Created user from setName prompt"
    );
    if (createdUser) {
      const sessionId = createdUser.sessions.find((session) => session.id)?.id;
      sessionId && session.set("sessionId", sessionId);
      console.log(createdUser);
      session.set("username", name);
      session.set("user_color", color);
      session.set("userId", createdUser.id);
    }

    // Set expiry time 4 hours from now
    // const expiryTime = formatISO(addHours(new Date(), 4))
    // session.set('expiryTime', expiryTime)
    if (tableId) {
      console.log(
        "\x1b[44m%s\x1b[0m",
        "table.tsx line:147 SSE TRIGGER because tableId exists and user entered name"
      );
      EVENTS.ISSUE_CHANGED(tableId);
      session.set("tableId", tableId);
    }

    // session.set('tutorial', true)
    console.timeEnd(`✅ Creating session and user with name... ${name}`);

    return redirect(redirectTo, {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  return null;
};

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
    <main className="bg-night-500 text-black">
      <h1>Rayos y centellas!</h1>
      <p>{error?.message}</p>
      <button className="bg-warning text-black">
        Back to <Link to={"/table"}> safety! </Link>
      </button>
    </main>
  );
};
