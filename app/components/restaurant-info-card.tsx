import { PersonIcon } from '@radix-ui/react-icons'
import { Link } from '@remix-run/react'
import { FaThumbsDown, FaUser } from 'react-icons/fa'
import { IoPerson, IoPersonOutline } from 'react-icons/io5'

import 'intro.js/introjs.css'

import { PlusIcon, RestMenuIcon, UserCircleIcon, WaiterIcon, WifiIcon } from './icons'
import { LinkButton } from './ui/buttons/button'
import { Spacer } from './util/spacer'
import { H5, H6 } from './util/typography'

export function RestaurantInfoCard({
  branch,
  menu,
  error,
  isOrderActive,
}: {
  branch: any
  menu: any
  error: string
  isOrderActive?: boolean
}) {
  return (
    <main className="">
      <div className="relative " id="container">
        <img
          src={branch.image}
          alt=""
          loading="lazy"
          className=" relative max-h-48 w-full rounded-b-3xl bg-day-bg_principal object-cover brightness-50"
        />

        <div className="absolute top-7 right-7 flex flex-row space-x-4 items-center">
          <Link to={`help/report`} className="flex flex-col items-center space-y-1">
            <div className="flex items-center justify-center h-10 border-2 rounded-full shadow-sm w-10 bg-white">
              <span>
                <FaThumbsDown className="h-4 w-4" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Reportar
            </H6>
          </Link>
          <Link to={`help/waiter`} className="flex flex-col items-center space-y-1 text-white">
            <div className="flex items-center justify-center h-10 text-white border-2 rounded-full shadow-sm w-10 bg-white">
              <span>
                <WaiterIcon className="h-4 w-4" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Llamar
            </H6>
          </Link>
          <Link to={`help/wifi`} className="flex flex-col items-center space-y-1">
            <div className="flex items-center justify-center h-10 text-white border-2 rounded-full shadow-sm w-10 bg-white">
              <span>
                <WifiIcon className="h-5 w-5" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Wifi
            </H6>
          </Link>
        </div>

        <div className="absolute bottom-5 left-5">
          <p className="text-sm tracking-widest text-white">{branch.cuisine.toUpperCase()}</p>
          <p className="text-xl font-semibold tracking-wider text-white">{branch.name}</p>
          <p className="text-white font-thin">{branch.address.length > 40 ? branch.address.substring(0, 40) + '...' : branch.address}</p>
          <p className="text-white">{branch.city}</p>
        </div>
      </div>
      <Spacer size="md" />
      {menu?.id ? (
        <div>
          {/* {!isOrderActive && <div className="">a</div>} */}
          <Link
            to={`menu/${menu?.id}`}
            // data-intro="Aquí puedes ver la carta de productos y ordenar"
            // data-step="1"
            // data-title="Carta"
            className="dark:bg-mainDark dark:text-mainTextDark dark:bg-night-bg_principal border-2  dark:text-night-text_principal flex items-center justify-between rounded-3xl bg-day-bg_principal px-6 py-4 text-lg"
          >
            <RestMenuIcon className="h-5 w-5" />
            <span className=" animate-pulse-color font-semibold">Ordena aquí</span>
            <div />
          </Link>
        </div>
      ) : (
        <div className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal flex flex-row items-center justify-between space-x-4 rounded-b-3xl border-2 px-6 py-4 text-sm drop-shadow-xl dark:text-button-textNotSelected">
          <PlusIcon className="h-6 w-6 rotate-45" />
          <p>{error}</p>
        </div>
      )}
    </main>
  )
}

export function RestaurantInfoCardV2({
  branch,
  menu,
  error,
  isOrderActive,
  tableNumber,
  user,
}: {
  branch: any
  menu: any
  error: string
  isOrderActive?: boolean
  tableNumber?: string | number
  user?: any
}) {
  return (
    <main className="">
      <div className="relative " id="container">
        <img
          src={branch.image}
          alt=""
          loading="lazy"
          className=" relative max-h-44 w-full rounded-b-3xl bg-day-bg_principal object-cover brightness-50"
        />
        <div className="absolute right-7 top-7">
          <Link to={`user/${user.userId}`} className=" flex flex-col text-center">
            <div className={`bg-white h-10 w-10 rounded-full flex  justify-center items-center border-2 border-white`}>
              <PersonIcon
                className={`w-5 h-5 text-[${user.user_color}]`}
                fill={user?.user_color || '#000'}
                style={{ color: user?.user_color }}
              />
            </div>
            <H6 className="text-white" boldVariant="semibold">
              {user.username}
            </H6>
          </Link>
        </div>
        <div className="absolute -bottom-5 w-full justify-center flex flex-row space-x-4 items-center">
          <div className="flex items-center justify-center h-24 w-24 rounded-full shadow-sm bg-white border-4">
            {/* <span>
              <FaThumbsDown className="h-4 w-4" />
            </span> */}
            <img className="object-cover max-w-full" src={branch.logo ? branch.logo : 'https://i.ibb.co/7tBbLkT/avocado.png'} alt="src" />
          </div>
        </div>
        <div className="absolute top-7 left-7 flex flex-row space-x-4 items-center">
          <Link to={`help/report`} className="flex flex-col items-center space-y-1">
            <div className="flex items-center justify-center h-10  rounded-full shadow-sm w-10 bg-white">
              <span>
                <FaThumbsDown className="h-4 w-4" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Reportar
            </H6>
          </Link>
          <Link to={`help/waiter`} className="flex flex-col items-center space-y-1 text-white">
            <div className="flex items-center justify-center h-10 text-white  rounded-full shadow-sm w-10 bg-white">
              <span>
                <WaiterIcon className="h-4 w-4" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Llamar
            </H6>
          </Link>
          <Link to={`help/wifi`} className="flex flex-col items-center space-y-1">
            <div className="flex items-center justify-center h-10 text-white  rounded-full shadow-sm w-10 bg-white">
              <span>
                <WifiIcon className="h-5 w-5" />
              </span>
            </div>
            <H6 className="text-white" boldVariant="semibold">
              Wifi
            </H6>
          </Link>
        </div>
        {/* 
        <div className="absolute bottom-5 left-5">
          <p className="text-sm tracking-widest text-white">{branch.cuisine.toUpperCase()}</p>
          <p className="text-xl font-semibold tracking-wider text-white">{branch.name}</p>
          <p className="text-white font-thin">{branch.address.length > 40 ? branch.address.substring(0, 40) + '...' : branch.address}</p>
          <p className="text-white">{branch.city}</p>
        </div> */}
      </div>
      <Spacer spaceY="5" />
      <h3 className="flex justify-center text-sm text-secondaryTextDark shrink-0">{`Mesa ${tableNumber}`}</h3>
      <Spacer size="md" />
      {menu?.id ? (
        <div>
          <Link
            to={`menu/${menu?.id}`}
            className="dark:bg-mainDark dark:text-mainTextDark dark:bg-night-bg_principal border-2  dark:text-night-text_principal flex items-center justify-between rounded-full bg-day-bg_principal px-6 py-4 text-lg"
          >
            <RestMenuIcon className="h-5 w-5" />
            <span className=" animate-pulse-color font-semibold">Ordena aquí</span>
            <div />
          </Link>
        </div>
      ) : (
        <div className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal flex flex-row items-center justify-between space-x-4 rounded-b-3xl border-2 px-6 py-4 text-sm drop-shadow-xl dark:text-button-textNotSelected">
          <PlusIcon className="h-6 w-6 rotate-45" />
          <p>{error}</p>
        </div>
      )}
    </main>
  )
}
