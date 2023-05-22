import {ClipboardCopyIcon} from '@heroicons/react/outline'
import {Spacer} from './util/spacer'
import {FlexRow} from './util/flexrow'
import {H5} from './util/typography'
import {LinkButton} from './buttons/button'

const REPORT_TYPES = {
  waitress: {
    name: 'waitress',
    icon: <ClipboardCopyIcon className="h-4 w-4 text-black dark:text-black" />,
    es: 'Mesero',
  },
  manager: {
    name: 'manager',
    icon: (
      <ClipboardCopyIcon
        className="dark:text-DARK_4 text-principal h-4 w-4"
        fontSize="small"
      />
    ),
    es: 'Gerente',
  },
  report: {
    name: 'report',
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="dark:text-warning text-warning h-4 w-4"
      />
    ),
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
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="text-principal h-4 w-4 dark:text-white"
      />
    ),
    es: 'Wifi',
  },
}

export function Help() {
  return (
    <Spacer spaceY="2">
      <FlexRow className="w-full justify-around ">
        {Object.values(REPORT_TYPES).map((type, index) => {
          return (
            <div className="flex flex-col items-center space-y-1" key={index}>
              <LinkButton
                to={`help/${type?.name}`}
                size="small"

                // className="flex items-center justify-center bg-white rounded-full dark:bg-DARK_1 h-9 w-9 "
                //   onClick={() => setShowModal(type?.name)}
              >
                {type.icon}
              </LinkButton>
              <H5 variant="secondary">{type?.es}</H5>
            </div>
          )
        })}
      </FlexRow>
    </Spacer>
  )
}
