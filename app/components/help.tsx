import {ClipboardCopyIcon} from '@heroicons/react/outline'
import {Spacer} from './util/spacer'
import {FlexRow} from './util/flexrow'
import {H5} from './util/typography'
import {LinkButton} from './buttons/button'

const REPORT_TYPES = {
  waitress: {
    name: 'waitress',
    icon: <ClipboardCopyIcon className="w-4 h-4 text-black dark:text-black" />,
    es: 'Mesero',
  },
  manager: {
    name: 'manager',
    icon: (
      <ClipboardCopyIcon
        className="w-4 h-4 dark:text-DARK_4 text-principal"
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
        className="w-4 h-4 dark:text-warning text-warning"
      />
    ),
    es: 'Reportar',
  },
  car: {
    name: 'car',
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="w-4 h-4 dark:text-DARK_4 text-principal"
      />
    ),
    es: 'Coche',
  },
  wifi: {
    name: 'wifi',
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="w-4 h-4 dark:text-DARK_4 text-principal"
      />
    ),
    es: 'Wifi',
  },
}

export function Help() {
  return (
    <Spacer spaceY="2">
      <FlexRow className="justify-around w-full ">
        {Object.values(REPORT_TYPES).map((type, index) => {
          return (
            <div className="flex flex-col items-center space-y-1" key={index}>
              <LinkButton
                to={`help/${type?.name}`}
                className="flex items-center justify-center bg-white rounded-full dark:bg-DARK_1 h-9 w-9 "
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
