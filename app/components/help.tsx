import { Link, useParams } from '@remix-run/react'

import { FeedBackIcon, ManagerIcon, WaiterIcon, WifiIcon } from './icons'
import { FlexRow } from './util/flexrow'
import { Spacer } from './util/spacer'
import { H5, H6 } from './util/typography'

const REPORT_TYPES = {
  waiter: {
    name: 'waiter',
    icon: <WaiterIcon className="h-4 w-4 text-white fill-white  " />,
    es: 'Llamar Mesero',
  },
  wifi: {
    name: 'wifi',
    icon: <WifiIcon className="h-5 w-5 text-white fill-white   " />,
    es: 'Wifi',
  },
  manager: {
    name: 'manager',
    icon: <ManagerIcon className="h-4 w-4   text-white fill-white " />,
    es: ' Llamar Gerente',
  },
  report: {
    name: 'report',
    icon: <FeedBackIcon className="h-4 w-4  text-white fill-white " />,
    es: 'Reportar Suceso',
  },
  // car: {
  //   name: 'car',
  //   icon: (
  //     <ClipboardCopyIcon
  //       fontSize="small"
  //       className="w-4 h-4 dark:text-DARK_4 text-principal"
  //     />
  //   ),
  //   es: 'Coche',
  // },
}

export function Help({ exclude }: { exclude?: string }) {
  const params = useParams()
  return (
    <Spacer spaceY="1">
      <FlexRow
        className="w-full justify-around relative"
        // data-intro="Aquí puedes interactuar con el restaurante directamente, como llamar al mesero, o reportar algun suceso"
        // data-step="2"
        // data-title="Acciones"
      >
        {Object.values(REPORT_TYPES).map((type, index) => {
          if (type.name === exclude) {
            return null
          }
          if (type.name === 'report' || type.name === 'wifi') {
            return null
          }
          return (
            <Link
              key={index}
              to={`${params.tableId}/help/${type?.name}`}
              className=" flex flex-col items-center space-y-1 w-1/4"
              preventScrollReset
              // className="flex items-center justify-center rounded-full bg-day-bg_principal dark:bg-night-bg_principal dark:bg-DARK_1 h-9 w-9 "
              //   onClick={() => setShowModal(type?.name)}
            >
              <div className=" flex h-8 w-8 items-center justify-center rounded-full border-2  text-white shadow-sm bg-day-principal">
                <span className="text-white fill-white">{type.icon}</span>
              </div>
              <H6 variant="secondary" className="text-[9px]">
                {type?.es}
              </H6>
            </Link>
          )
        })}
        <Link
          to={`${params.tableId}/help/report`}
          className="absolute mx-auto flex  flex-col -top-4 justify-center items-center "
          preventScrollReset
        >
          <div className="rounded-full flex h-10 w-10 items-center justify-center bg-day-principal border-2 ">
            <FeedBackIcon className="h-4 w-4  fill-white " />
          </div>
          <H6 variant="secondary" className="text-[9px]">
            Reportar
          </H6>
        </Link>
      </FlexRow>
    </Spacer>
  )
}

export function HelpWithoutOrder({ exclude }: { exclude?: string }) {
  return (
    <Spacer spaceY="2">
      <FlexRow
        className="w-full justify-around "
        data-intro="Aquí puedes interactuar con el restaurante directamente, como llamar al mesero, o reportar algun suceso"
        data-step="2"
        data-title="Acciones"
      >
        {Object.values(REPORT_TYPES).map((type, index) => {
          if (type.name === exclude) {
            return null
          }
          return (
            <div className="flex flex-col items-center space-y-1 " key={index}>
              <Link
                to={`help/${type?.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2  text-white shadow-sm bg-day-principal"

                // className="flex items-center justify-center rounded-full bg-day-bg_principal dark:bg-night-bg_principal dark:bg-DARK_1 h-9 w-9 "
                //   onClick={() => setShowModal(type?.name)}
              >
                <span className="text-white fill-white">{type.icon}</span>
              </Link>
              <H6 variant="secondary" className="text-[9px]">
                {type?.es}
              </H6>
            </div>
          )
        })}
      </FlexRow>
    </Spacer>
  )
}
