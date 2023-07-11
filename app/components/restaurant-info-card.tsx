import { BookOpenIcon, XCircleIcon } from "@heroicons/react/outline";
import { Link } from "@remix-run/react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { useEffect } from "react";

export function RestaurantInfoCard({
  branch,
  menu,
  error,
  isOrderActive,
}: {
  branch: any;
  menu: any;
  error: string;
  isOrderActive?: boolean;
}) {
  return (
    <main className="px-1 pt-4">
      <div className="relative " id="container">
        <img
          src={branch.ppt_image}
          alt=""
          loading="lazy"
          className="dark:bg-secondaryDark dark:bg-night-bg_principal dark:text-night-text_principal relative max-h-40 w-full rounded-t-3xl bg-day-bg_principal object-cover brightness-50"
        />
        <div className="absolute bottom-5 left-5">
          <p className="text-sm tracking-widest text-white">
            {branch.cuisine.toUpperCase()}
          </p>
          <p className="text-2xl font-normal tracking-wider text-white">
            {branch.name}
          </p>
          <p className="text-white">
            {branch.address.length > 40
              ? branch.address.substring(0, 40) + "..."
              : branch.address}
          </p>
          <p className="text-white">{branch.city}</p>
        </div>
      </div>
      {/* <Spacer size="md" /> */}
      {menu?.id ? (
        <div>
          {/* {!isOrderActive && <div className="">a</div>} */}
          <Link
            to={`menu/${menu?.id}`}
            data-intro="Aquí puedes ver la carta de platillos y bebidas que ofrece el restaurante."
            data-step="1"
            data-title="Carta"
            className="dark:bg-mainDark dark:text-mainTextDark dark:bg-night-bg_principal dark:text-night-text_principal flex items-center justify-between rounded-b-3xl bg-day-bg_principal px-6 py-4 text-lg drop-shadow-xl"
          >
            <BookOpenIcon className="h-6 w-6" />
            <span>Ver la carta</span>
            <div />
          </Link>
        </div>
      ) : (
        <div className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal flex flex-row items-center justify-between space-x-4 rounded-b-3xl border-2 px-6 py-4 text-sm drop-shadow-xl dark:text-button-textNotSelected">
          <XCircleIcon className="h-6 w-6" />
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}
