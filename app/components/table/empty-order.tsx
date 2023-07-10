import introJs from 'intro.js'
import 'intro.js/introjs.css'
import {useEffect} from 'react'
// * MODELS

// * CUSTOM COMPONENTS
import {SectionContainer} from '../containers/section-container'
import {RestaurantInfoCard} from '../restaurant-info-card'
import {UserButton} from '../ui/buttons/UserButton'
import {FlexRow} from '../util/flexrow'
import {Spacer} from '../util/spacer'
import {H4, H5} from '../util/typography'

export function EmptyOrder({
  branch,
  menu,
  error,
  tableNumber,
  usersInTable,
  isOrderActive,
}: {
  branch: any
  menu: any
  error: string
  tableNumber: number
  usersInTable: any
  isOrderActive: boolean
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
      {/* <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm dark:bg-secondaryDark dark:bg-night-bg_principal bg-day-bg_principal ">
      <ChevronDoubleUpIcon className="w-5 h-5 motion-safe:animate-bounce" />
    </div>*/}
      <Spacer spaceY="2" />
      <H5 className="flex w-full justify-center ">Aún no existe una orden con platillos.</H5>
      <Spacer spaceY="3">
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center pr-2 text-sm">{`Mesa ${tableNumber}`}</h3>
      </Spacer>
      <SectionContainer
        className="dark:bg-DARK_1 dark:bg-night-bg_principal dark:text-night-text_principal flex flex-col justify-start rounded-lg bg-day-bg_principal p-2 drop-shadow-md dark:drop-shadow-none"
        data-intro="Aquí puedes ver quién está en la mesa"
        data-step="2"
        data-title="Usuarios"
      >
        <p className="text-DARK_3">Usuarios en la mesa</p>
        <Spacer spaceY="2">
          <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
        </Spacer>
        {usersInTable &&
          usersInTable.map((user, index: number) => (
            <FlexRow className="w-full items-center justify-between space-x-2 space-y-2" key={user.id}>
              <FlexRow className="items-center space-x-2">
                <UserButton userColor={user?.color} path={`user/${user?.id}`} />
                {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
              </FlexRow>
              {/* <div>
                <Link
                  preventScrollReset
                  to={`user/${user?.id}`}
                  className="flex flex-row items-center justify-center px-2 py-1 rounded-full dark:bg-buttonBgDark bg-componentBg "
                >
                  Detalles
                </Link>
              </div> */}
            </FlexRow>
          ))}
      </SectionContainer>
    </main>
  )
}