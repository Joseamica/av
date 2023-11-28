import { Link, useLoaderData } from '@remix-run/react'
import { FaExclamation } from 'react-icons/fa'
import { IoCard, IoList, IoPerson, IoShieldCheckmarkOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { formatCurrency } from '~/utils'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const employeeId = session.get('employeeId')
  const feedbacks = await prisma.feedback.findMany({
    where: {
      branchId,
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
  })

  return json({ feedbacks })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Reports() {
  const data = useLoaderData()
  return (
    <div>
      <div className="px-[10px]">
        {data.feedbacks.map(feedback => {
          return (
            // <div key={feedback.id}>
            //   <span>{feedback.type}</span>
            //   <span>{feedback.report}</span>
            //   <span>{feedback.comments}</span>
            // </div>
            <Feedback to={feedback.id} feedback={feedback} key={feedback.id} />
          )
        })}
      </div>
    </div>
  )
}

export function Feedback({ to, feedback }: { to: string; feedback: any }) {
  return (
    <Link to={to} className="w-full  relative flex items-center justify-between space-x-4" preventScrollReset>
      <div className="border rounded-lg flex justify-around w-full">
        <div className="flex justify-center items-center  bg-dashb-bg w-14 rounded-lg">
          <p className="text-3xl">{feedback.id.slice(-4)}</p>
        </div>
        <div className="flex flex-row  divide-x divide-gray-300 items-center w-full h-full  bg-white rounded-lg  ">
          <FeedbackContainer
            title="Report"
            value={feedback.type}
            icon={<FaExclamation className="bg-indigo-500 rounded-sm p-1 fill-white" />}
          />
          {/* <FeedbackContainer
            title="Productos"
            value={products?.length}
            icon={<IoList className="bg-[#F19F82] rounded-sm p-1 fill-white text-white" />}
          />*/}
          <FeedbackContainer
            title="Comments"
            value={feedback.comments}
            icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
          />
        </div>
      </div>
      <div className="right-2">
        <IoShieldCheckmarkOutline />
      </div>
    </Link>
  )
}

export function FeedbackContainer({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <div className="flex flex-col space-y-1  px-3 py-2 w-full">
      <div />
      <div className="flex flex-row space-x-2 items-center ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
