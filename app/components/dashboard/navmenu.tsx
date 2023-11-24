import clsx from 'clsx'

import { H5 } from '../util/typography'

export function NavMenu({
  categories,
  activeNavMenu,
  setActiveNavMenu,
  notify,
}: {
  categories: string[]
  activeNavMenu: string
  setActiveNavMenu: (category: string) => void
  notify?: boolean
}) {
  return (
    <div className="flex items-center w-full pl-4 space-x-3 bg-white h-11">
      <div className="flex flex-row space-x-5">
        {categories?.map((category, index) => {
          return (
            <button onClick={() => setActiveNavMenu(category)} key={index} className="relative flex flex-row items-center space-x-1">
              {/* <div className="w-3 h-3 rounded-full bg-dashb-bg"></div> */}
              {notify && category === 'Pagos' ? (
                <div className="absolute top-0 w-2 h-2 bg-red-500 rounded-full animate-pulse -right-3" />
              ) : null}
              <H5
                className={clsx('', {
                  'text-indigo-500 underline underline-offset-8': activeNavMenu === category,
                })}
              >
                {category}
              </H5>
            </button>
          )
        })}
      </div>
    </div>
  )
}
