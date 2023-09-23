import { Form, Link, useLocation, useSearchParams } from '@remix-run/react'

import { QueryDialog } from './ui/dialogs/dialog'

import { ChevronLeftIcon, PlusIcon } from '~/components/icons'
import { DropDown } from '~/components/ui/buttons/dropdown'
import { FlexRow } from '~/components/util/flexrow'
import { H1, H3, H4 } from '~/components/util/typography'

export function HeaderSection({
  backPath,
  title,
  breadcrumb,
  addQuery,
  showAdd = true,
  data,
}: {
  backPath: string
  title: string
  breadcrumb?: string
  addQuery?: string
  showAdd?: boolean
  data?: any
}) {
  if (breadcrumb) {
    return (
      <>
        <FlexRow className="flex justify-between w-full">
          <div className="flex items-center space-x-2 text-gray-500">
            {/* <Link to={backPath}>
            <ChevronLeftIcon className="w-12 h-12" />
          </Link> */}
            <Link to={backPath} className="overflow-hidden text-blue-700 hover:underline text-ellipsis">
              <H1>{title}</H1>
            </Link>
            <span>&gt;</span>
            <H3>{breadcrumb.substring(0, 15) + '...'}</H3>
          </div>
          <div className="flex-grow" /> {/* This will push the Add button to the right */}
          {/* <DropDown data={data} /> */}
        </FlexRow>
        <QueryDialog query="showDel" title="Are you sure that you want to delete this item?">
          <Form className="flex items-center space-x-2" method="POST">
            <button
              name="_action"
              value="del"
              className="flex items-center px-4 py-2 space-x-2 text-white border-2 rounded-full bg-warning"
            >
              <H4>Yes</H4>
            </button>
            <Link to={`?accessItem=${breadcrumb}`} className="flex items-center px-4 py-2 space-x-2 bg-white border-2 rounded-full">
              <H4>No</H4>
            </Link>
          </Form>
        </QueryDialog>
      </>
    )
  }
  return (
    <FlexRow className="flex justify-between w-full">
      <div className="flex items-center">
        <H1>{title}</H1>
      </div>
      {showAdd && (
        <>
          <div className="flex-grow" /> {/* This will push the Add button to the right */}
          <Link to={addQuery}>
            <FlexRow className="px-4 py-2 bg-white border-2 rounded-full">
              Add <PlusIcon className="w-6 h-6" />
            </FlexRow>
          </Link>
        </>
      )}
    </FlexRow>
  )
}

interface HeaderWithButtonProps {
  queryKey: string
  queryValue: string
  buttonLabel: string
  IconComponent?: React.ComponentType // Optionally you can pass a different icon component
}

export const HeaderWithButton: React.FC<HeaderWithButtonProps> = ({
  queryKey,
  queryValue,
  buttonLabel,
  IconComponent = PlusIcon, // Default to PlusIcon if no IconComponent is provided
}) => {
  const location = useLocation()
  const title = location.pathname.split('/').pop()

  const [searchParams, setSearchParams] = useSearchParams()

  const handleButtonClick = () => {
    searchParams.set(queryKey, queryValue)
    setSearchParams(searchParams)
  }

  return (
    <div className="flex flex-row items-center justify-between h-20 p-4 bg-white border-b-2">
      <FlexRow>
        <Link to=".." className="rounded-full hover:bg-button-primary hover:text-white">
          <ChevronLeftIcon className="w-10 h-10" />
        </Link>
        <H1 className="capitalize">{title}</H1>
      </FlexRow>
      <button onClick={handleButtonClick}>
        <FlexRow className="px-4 py-2 bg-white border-2 rounded-full hover:bg-button-primary hover:text-white">
          {buttonLabel} <IconComponent className="w-6 h-6" />
        </FlexRow>
      </button>
    </div>
  )
}
