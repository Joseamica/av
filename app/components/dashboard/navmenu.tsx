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
    <div className="w-full flex bg-white h-11 items-center pl-3 space-x-10">
      <div className="flex flex-row space-x-5">
        {categories?.map((category, index) => {
          return (
            <button onClick={() => setActiveNavMenu(category)} key={index} className="flex flex-row items-center space-x-1">
              <div
                className={clsx('w-3 h-3 bg-dashb-bg rounded-full', {
                  'bg-indigo-500': activeNavMenu === category,
                })}
              ></div>
              <p
                className={clsx({
                  'text-indigo-500 ': activeNavMenu === category,
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
