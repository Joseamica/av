import {ClipboardCopyIcon} from '@heroicons/react/outline'
import {Spacer} from './util/spacer'
import {FlexRow} from './util/flexrow'
import {H5} from './util/typography'

const REPORT_TYPES = {
  waitress: {
    name: 'waitress',
    icon: (
      <ClipboardCopyIcon className="dark:text-DARK_4 text-principal h-4 w-4" />
    ),
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
    es: 'Ayuda',
  },
  car: {
    name: 'car',
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="dark:text-DARK_4 text-principal h-4 w-4"
      />
    ),
    es: 'Coche',
  },
  wifi: {
    name: 'wifi',
    icon: (
      <ClipboardCopyIcon
        fontSize="small"
        className="dark:text-DARK_4 text-principal h-4 w-4"
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
              <button
                className="dark:bg-DARK_1 flex h-9 w-9 items-center justify-center rounded-full bg-white "
                //   onClick={() => setShowModal(type?.name)}
              >
                {type.icon}
              </button>
              <H5 variant="secondary">{type?.es}</H5>
            </div>
          )
        })}
      </FlexRow>
    </Spacer>
  )
}
