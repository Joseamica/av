import clsx from 'clsx'

export function NavMenu({
  categories,
  activeNavMenu,
  setActiveNavMenu,
}: {
  categories: string[]
  activeNavMenu: string
  setActiveNavMenu: (category: string) => void
}) {
  return (
    <div className="w-full flex bg-white h-11 items-center pl-4 space-x-3">
      <div className="flex flex-row space-x-5">
        {categories?.map((category, index) => {
          return (
            <button onClick={() => setActiveNavMenu(category)} key={index} className="flex flex-row items-center space-x-1">
              {/* <div className="w-3 h-3 bg-dashb-bg rounded-full"></div> */}
              <p
                className={clsx('', {
                  'text-indigo-500 underline underline-offset-8': activeNavMenu === category,
                })}
              >
                {category}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
