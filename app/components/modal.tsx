import { useNavigate } from '@remix-run/react'
import type { ReactNode } from 'react'
import React from 'react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { ChevronLeftIcon, XIcon } from './icons'
import { BackButton } from './ui/buttons/back-button'
import { Button } from './ui/buttons/button'

const effect = {
  hidden: {
    y: '100vh',
    opacity: 0,
  },
  visible: {
    y: '0',
    opacity: 1,
    transition: {
      type: 'linear',
      stiffness: 600,
      // duration: 3,
      damping: 30,
    },
  },
  exit: {
    y: '100vh',
    opacity: 0,
  },
}

/**
 *
 * @param children
 * @param onClose - function to close the modal
 * @param fullScreen - boolean to set the modal to full screen
 * @param title - string to set the title of the modal
 * @param ariaLabel - string to set the aria-label of the modal
 * @returns
 */

const justifyItems = {
  start: 'justify-start',
  between: 'justify-between',
  center: 'justify-center',
  end: 'justify-end',
}
export function Modal({
  children,
  className,
  onClose,
  fullScreen = false,
  title = 'Titulo',
  ariaLabel,
  goBack = false,
  imgHeader,
  justify = 'between',
  showCart,
}: {
  children: ReactNode
  onClose: () => void
  className?: string
  fullScreen?: boolean
  title: string
  ariaLabel?: string
  goBack?: boolean
  imgHeader?: string
  showCart?: JSX.Element
} & { justify?: keyof typeof justifyItems }) {
  //NOTE - this is to prevent the background from scrolling when the modal is open maybe ! **fix?**
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <motion.main
      className={clsx(
        'bg-backdrop fixed  inset-0 z-50 flex max-h-screen flex-row items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm backdrop-filter',
      )}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        <motion.dialog
          className={clsx(
            'no-scrollbar  dark:text-night-text_principal inset-x-0 bottom-0 m-0 mx-auto flex max-h-full w-full flex-col overflow-auto  rounded-t-lg bg-day-bg_principal p-0 dark:bg-[#F3F4F6] ',
            justifyItems[justify],
            { 'top-0 h-full': fullScreen },
          )}
          open
          variants={effect}
          initial="hidden"
          tabIndex={-1}
          role="dialog"
          aria-modal={true}
          aria-label={ariaLabel}
          animate="visible"
          exit="exit"
          onClick={event => event.stopPropagation()}
        >
          {imgHeader ? (
            <div className="sticky top-0 ">
              <button
                onClick={onClose}
                aria-label={`Close ${ariaLabel || 'dialog'}`}
                className={`${' dark:bg-night-bg_principal dark:text-night-text_principal absolute right-5 top-5 flex  h-10 w-10 items-center justify-center rounded-full bg-day-bg_principal shadow-md focus:border-0 focus:ring-0 dark:shadow-sm  dark:shadow-black '}`}
                type="button"
              >
                <XIcon className="w-6 h-6" />
              </button>
              <img
                alt=""
                src={imgHeader}
                className="object-cover w-full bg-white rounded-t-lg dark:bg-secondaryDark max-h-52"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="sticky inset-x-0 top-0 z-10 flex flex-row items-center justify-between w-full p-4 border-b-2 gap-x-2 dark:bg-night-bg_principal dark:text-night-text_principal bg-day-bg_principal">
              {showCart ? (
                <>
                  <XIcon className="p-1 border rounded-full h-7 w-7 dark:text-night-700" onClick={onClose} />
                  <p className="font-bold">{title}</p>
                  {showCart}
                </>
              ) : (
                <>
                  {goBack ? <BackButton url={''} /> : <div />}
                  <p>{title}</p>
                  <XIcon className="p-1 border rounded-full h-7 w-7 dark:text-night-700" onClick={onClose} />
                </>
              )}
            </div>
          )}
          {children}
        </motion.dialog>
      </AnimatePresence>
    </motion.main>
  )
}

export function SubModal({
  children,
  className,
  onClose,
  fullScreen = false,
  title = 'Titulo',
  ariaLabel,
  goBack = false,
  imgHeader,
  justify = 'between',
}: {
  children: ReactNode
  onClose: () => void
  className?: string
  fullScreen?: boolean
  title: string
  ariaLabel?: string
  goBack?: boolean
  imgHeader?: string
} & { justify?: keyof typeof justifyItems }) {
  const navigate = useNavigate()

  const NavigateBack = () => {
    navigate('')
  }

  // const handleKeyDown = (event: any) => {
  //   if (event.key !== 'Escape') return

  //   onClose()
  // }

  // React.useEffect(() => {
  //   if (!isOpen) return

  //   document.body.style.overflow = 'hidden'
  //   document.addEventListener('keydown', handleKeyDown)

  //   return () => {
  //     document.body.style.overflow = 'auto'
  //     document.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [])

  return (
    <motion.main
      className={clsx(
        'bg-backdrop fixed  inset-0 z-50 flex max-h-screen h-full flex-row items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm backdrop-filter',
      )}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        <motion.dialog
          className={clsx(
            'no-scrollbar  dark:text-night-text_principal inset-x-0 bottom-0 m-0 mx-auto flex max-h-full w-full flex-col overflow-auto  rounded-t-lg bg-day-bg_principal p-2 dark:bg-[#F3F4F6] ',
            justifyItems[justify],
            { 'top-0 h-full': fullScreen },
          )}
          open
          variants={effect}
          initial="hidden"
          tabIndex={-1}
          role="dialog"
          aria-modal={true}
          aria-label={ariaLabel}
          animate="visible"
          exit="exit"
          onClick={event => event.stopPropagation()}
        >
          {imgHeader ? (
            <div className="">
              <button
                onClick={onClose}
                aria-label={`Close ${ariaLabel || 'dialog'}`}
                className={`${' dark:bg-night-bg_principal dark:text-night-text_principal absolute right-5 top-5 flex  h-10 w-10 items-center justify-center rounded-full bg-day-bg_principal shadow-md focus:border-0 focus:ring-0 dark:shadow-sm  dark:shadow-black '}`}
              >
                <XIcon className="w-6 h-6" />
              </button>
              <img
                alt=""
                src={imgHeader}
                className="object-cover w-full bg-white rounded-t-lg dark:bg-secondaryDark max-h-72"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="dark:bg-night-bg_principal dark:text-night-text_principal sticky inset-x-0 top-0 z-[9999] mb-2 flex w-full flex-row items-center justify-between border-b-2 bg-day-bg_principal p-4">
              {goBack ? (
                <Button onClick={NavigateBack} size="small">
                  <ChevronLeftIcon />
                </Button>
              ) : (
                <div />
              )}
              {title}
              <XIcon className="p-1 rounded-full shadow-lg h-7 w-7 dark:text-night-700" onClick={onClose} />
            </div>
          )}
          {children}
        </motion.dialog>
      </AnimatePresence>
    </motion.main>
  )
}
