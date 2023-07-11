import type {Branch, Menu} from '@prisma/client'
import {AnimatePresence, motion} from 'framer-motion'

export const MenuInfo = ({
  menu,
  branch,
  children,
}: {
  menu: Menu
  branch: Branch
  children?: React.ReactNode | React.ReactNode[]
}) => {
  return (
    <AnimatePresence mode="wait">
      {menu.image && (
        <motion.div
          className={` relative flex flex-row `}
          id="container"
          initial={{opacity: 0, y: '100%'}}
          animate={{opacity: 1, display: 'relative', y: '0%'}}
          transition={{delay: 0.5}}
        >
          {
            <img
              src={menu.image || ''}
              alt=""
              className="dark:bg-secondaryDark dark:bg-night-bg_principal max-h-40 w-full rounded-3xl bg-day-bg_principal object-cover brightness-50 "
              loading="lazy"
            />
          }
          <div className="absolute inset-0 flex w-full flex-col items-center justify-center">
            <h1 className="overflow-hidden text-center text-3xl font-medium uppercase tracking-wider text-white">
              {branch.name.length > 20 ? branch.name.substring(0, 20) + '...' : branch.name}
            </h1>
            <h2 className="text-xl text-white">MENU</h2>
          </div>
          <div className="absolute flex w-full flex-row justify-between p-4 ">
            <div className="flex flex-col justify-center">
              <br />
            </div>
            <div className="flex w-1/2 justify-end ">{children}</div>

            {/* <p className="text-white">
          {branch.address} • {branch.extraAddress}
        </p> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
