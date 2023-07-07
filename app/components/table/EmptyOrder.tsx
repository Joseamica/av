import { Link } from "@remix-run/react";
// * MODELS
import { User } from "@prisma/client";
// * CUSTOM COMPONENTS
import { SectionContainer } from "../containers/SectionContainer";
import { RestaurantInfoCard } from "../RestaurantInfoCard";
import { UserButton } from "../ui/buttons/UserButton";
import { FlexRow } from "../util/flexrow";
import { Spacer } from "../util/spacer";
import { H4, H5 } from "../util/typography";

export function EmptyOrder({
  tableNumber,
  usersInTable,
}: {
  tableNumber: number;
  usersInTable: User[];
}) {
  return (
    <main>
      <RestaurantInfoCard />
      {/* <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm dark:bg-secondaryDark dark:bg-night-bg_principal bg-day-bg_principal ">
      <ChevronDoubleUpIcon className="w-5 h-5 motion-safe:animate-bounce" />
    </div>*/}
      <Spacer spaceY="2" />
      <H5 className="flex w-full justify-center ">
        Aún no existe una orden con platillos.
      </H5>
      <Spacer spaceY="3">
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center pr-2 text-sm">
          {`Mesa ${tableNumber}`}
        </h3>
      </Spacer>
      <SectionContainer className="dark:bg-DARK_1 dark:bg-night-bg_principal dark:text-night-text_principal flex flex-col justify-start rounded-lg bg-day-bg_principal p-2 drop-shadow-md dark:drop-shadow-none">
        <p className="text-DARK_3">Usuarios en la mesa</p>
        <Spacer spaceY="2">
          <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
        </Spacer>
        {usersInTable?.map((user, index: number) => (
          <FlexRow
            className="w-full items-center justify-between space-x-2 space-y-2"
            key={user.id}
          >
            <FlexRow className="items-center space-x-2">
              <UserButton userColor={user?.color} path={`user/${user?.id}`} />
              {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
            </FlexRow>
            <div>
              <Link
                preventScrollReset
                to={`user/${user?.id}`}
                className="dark:bg-buttonBgDark bg-componentBg flex flex-row items-center justify-center rounded-full px-2 py-1 "
              >
                Detalles
              </Link>
            </div>
          </FlexRow>
        ))}
      </SectionContainer>
    </main>
  );
}
