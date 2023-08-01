import {WifiIcon, BellIcon} from '@heroicons/react/solid'
import {Link} from '@remix-run/react'
import {IoIosPerson} from 'react-icons/io'
import {IoWarning} from 'react-icons/io5'
import {FlexRow} from './util/flexrow'
import {Spacer} from './util/spacer'
import {H5} from './util/typography'
import {FaWifi} from 'react-icons/fa'

const REPORT_TYPES = {
  waiter: {
    name: 'waiter',
    icon: <BellIcon className="h-5 w-5" />,
    es: 'Mesero',
  },
  manager: {
    name: 'manager',
    icon: <IoIosPerson className="h-5 w-5" fontSize="small" />,
    es: 'Gerente',
  },
  report: {
    name: 'report',
    icon: <IoWarning className="h-5 w-5" fontSize="small" />,
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
    icon: <FaWifi fontSize="small" className="h-5 w-5 " />,
    es: 'Wifi',
  },
}

export function Help() {
  return (
    <Spacer spaceY="2">
      <FlexRow className="w-full justify-around rounded-xl bg-white py-2 shadow-lg">
        {Object.values(REPORT_TYPES).map((type, index) => {
          return (
            <div className="flex flex-col items-center space-y-1 " key={index}>
              <Link
                to={`help/${type?.name}`}
                className="flex h-9  w-9 items-center justify-center rounded-full bg-white shadow-md"

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
