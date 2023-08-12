import { Form, Link, useSearchParams } from '@remix-run/react'
import { IoTrash } from 'react-icons/io5'

import { QueryDialog } from './dialogs/dialog'

import { PlusIcon } from '~/components/icons'
import { FlexRow } from '~/components/util/flexrow'
import { H1, H3, H4 } from '~/components/util/typography'

export default function HeaderSection({
  backPath,
  title,
  breadcrumb,
  addQuery,
}: {
  backPath: string
  title: string
  breadcrumb?: string
  addQuery?: string
}) {
  const [searchParams, setSearchParams] = useSearchParams()

  if (breadcrumb) {
    return (
      <>
        <FlexRow className="flex justify-between w-full">
          <div className="flex space-x-2 text-gray-500 items-center">
            {/* <Link to={backPath}>
            <ChevronLeftIcon className="w-12 h-12" />
          </Link> */}
            <Link to={backPath} className="text-blue-700 hover:underline text-ellipsis overflow-hidden">
              <H1>{title}</H1>
            </Link>
            <span>&gt;</span>
            <H3>{breadcrumb.substring(0, 15) + '...'}</H3>
          </div>
          <div className="flex-grow" /> {/* This will push the Add button to the right */}
          {/* <Form method="POST"> */}
          <button
            onClick={() => {
              searchParams.append('showDel', 'true')
              setSearchParams(searchParams)
            }}
            className="flex items-center space-x-2 rounded-full border-2 bg-white px-4 py-2"
          >
            <H4>Delete</H4>
            <IoTrash className="w-6 h-6 ml-2" />
          </button>
        </FlexRow>
        <QueryDialog query="showDel" title="Are you sure that you want to delete this item?">
          <Form className="flex items-center space-x-2" method="POST">
            <button
              name="_action"
              value="del"
              className="flex items-center space-x-2 rounded-full border-2 bg-warning text-white px-4 py-2"
            >
              <H4>Yes</H4>
            </button>
            <Link to={`?accessItem=${breadcrumb}`} className="flex items-center space-x-2 rounded-full border-2 bg-white px-4 py-2">
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
      <div className="flex-grow" /> {/* This will push the Add button to the right */}
      <Link to={addQuery}>
        <FlexRow className="rounded-full border-2 bg-white px-4 py-2">
          Add <PlusIcon className="w-6 h-6" />
        </FlexRow>
      </Link>
    </FlexRow>
  )
}
