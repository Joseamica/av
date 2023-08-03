import { Link } from '@remix-run/react'
import { FlexRow } from './util/flexrow'
import { Spacer } from './util/spacer'
import { H5 } from './util/typography'
import { FeedBackIcon, ManagerIcon, WaiterIcon, WifiIcon } from './icons'

const REPORT_TYPES = {
  waiter: {
    name: 'waiter',
    icon: <WaiterIcon className="h-4 w-4  fill-white " />,
    es: 'Mesero',
  },
  manager: {
    name: 'manager',
    icon: <ManagerIcon className="h-4 w-4  fill-white text-white " />,
    es: 'Gerente',
  },
  report: {
    name: 'report',
    icon: <FeedBackIcon className="h-4 w-4 fill-white " />,
    es: 'Reportar',
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
  wifi: {
    name: 'wifi',
    icon: <WifiIcon className="h-5 w-5  fill-white " />,
    es: 'Wifi',
  },
}

export function Help() {
  return (
    <Spacer spaceY="2">
      <FlexRow className="w-full justify-around">
        {Object.values(REPORT_TYPES).map((type, index) => {
          return (
            <div className="flex flex-col items-center space-y-1 " key={index}>
              <Link
                to={`help/${type?.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-day-principal shadow-md"

                // className="flex items-center justify-center rounded-full bg-day-bg_principal dark:bg-night-bg_principal dark:bg-DARK_1 h-9 w-9 "
                //   onClick={() => setShowModal(type?.name)}
              >
                {type.icon}
              </Link>
              <H5 variant="secondary">{type?.es}</H5>
            </div>
          )
        })}
      </FlexRow>
    </Spacer>
  )
}
