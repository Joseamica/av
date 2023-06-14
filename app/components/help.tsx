import {BellIcon, ClipboardCopyIcon} from '@heroicons/react/outline'
import {Spacer} from './util/spacer'
import {FlexRow} from './util/flexrow'
import {H5} from './util/typography'
import {LinkButton} from './buttons/button'
import {Link} from '@remix-run/react'

const REPORT_TYPES = {
  waiter: {
    name: 'waiter',
    icon: <BellIcon className="h-4 w-4" />,
    es: 'Mesero',
  },
  manager: {
    name: 'manager',
    icon: <ClipboardCopyIcon className="h-4 w-4" fontSize="small" />,
    es: 'Gerente',
  },
  report: {
    name: 'report',
    icon: <ClipboardCopyIcon fontSize="small" className="h-4 w-4 " />,
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
    icon: <ClipboardCopyIcon fontSize="small" className="h-4 w-4 " />,
    es: 'Wifi',
  },
}

export function Help() {
  return (
    <Spacer spaceY="2">
      <FlexRow className="w-full justify-around ">
        {Object.values(REPORT_TYPES).map((type, index) => {
          return (
            <div className="flex flex-col items-center space-y-1 " key={index}>
              <Link
                to={`help/${type?.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"

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
