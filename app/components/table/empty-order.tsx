import { Link, Outlet } from '@remix-run/react'
import { useEffect } from 'react'

import introJs from 'intro.js'
import 'intro.js/introjs.css'

import { HelpWithoutOrder } from '../help'

// * MODELS
// * CUSTOM COMPONENTS
import { FlexRow, H4, H5, H6, Help, RestaurantInfoCard, SectionContainer, Spacer, UserButton, WifiIcon } from '~/components/'

export function EmptyOrder({
  branch,
  menu,
  error,
  tableNumber,
  usersInTable,
  isOrderActive,
  exclude,
}: {
  branch: any
  menu: any
  error: string
  tableNumber: number
  usersInTable: any
  isOrderActive: boolean
  exclude: string
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      introJs()
        .setOptions({
          isActive: !isOrderActive ? true : false,
          showProgress: true,
          dontShowAgain: true,
          dontShowAgainLabel: 'No volver a mostrar',
          dontShowAgainCookieDays: 1,
          buttonClass: 'bg-button-primary rounded-lg text-white px-4 py-2',
        })
        .start()
    }, 1500) // 2 seconds delay

    // Cleanup function to clear the timer when the component unmounts or when isOrderActive changes
    return () => clearTimeout(timer)
  }, [isOrderActive])

  return (
    <main>
      <RestaurantInfoCard branch={branch} menu={menu} error={error} isOrderActive={isOrderActive} />
      <Spacer spaceY="2" />
      <H5 className="flex w-full justify-center ">Aún no existe una orden con platillos.</H5>
      <Spacer spaceY="3">
        {/* <h3 className="text-secondaryTextDark flex shrink-0 justify-center pr-2 text-sm">{`Mesa ${tableNumber}`}</h3> */}
        <div className="flex flex-col items-center space-y-1 ">
          <Link
            to={`help/wifi`}
            className="flex h-10 w-14 items-center justify-center rounded-full border-2  text-white shadow-sm"

            // className="flex items-center justify-center rounded-full bg-day-bg_principal dark:bg-night-bg_principal dark:bg-DARK_1 h-9 w-9 "
            //   onClick={() => setShowModal(type?.name)}
          >
            <span className="text-white fill-white">
              <WifiIcon />
            </span>
          </Link>
          <H6 variant="secondary">Wifi</H6>
        </div>
      </Spacer>
      {/* <HelpWithoutOrder exclude={exclude} /> */}

      {usersInTable && (
        <SectionContainer
          className="dark:bg-DARK_1 dark:bg-night-bg_principal dark:text-night-text_principal flex flex-col justify-start rounded-lg bg-day-bg_principal p-2 drop-shadow-md dark:drop-shadow-none"
          data-intro="Aquí puedes ver quién está en la mesa"
          data-step="3"
          data-title="Usuarios"
        >
          <p className="text-DARK_3">Usuarios en la mesa</p>
          <Spacer spaceY="2">
            <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
          </Spacer>
          {usersInTable.map((user, index: number) => (
            <FlexRow className="w-full items-center justify-between space-x-2 space-y-2" key={user.id}>
              <FlexRow className="items-center space-x-2">
                <UserButton userColor={user?.color} path={`user/${user?.id}`} />
                {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
              </FlexRow>
            </FlexRow>
          ))}
        </SectionContainer>
      )}
      <Outlet />
    </main>
  )
}
