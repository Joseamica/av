import {XIcon} from '@heroicons/react/outline'
import {Form, useNavigate, useSubmit} from '@remix-run/react'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import type {ReactNode} from 'react'
import {IoMdArrowBack} from 'react-icons/io'
import {Button} from './buttons/button'
import React from 'react'

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
export function Modal({
  children,
  onClose,
  fullScreen = false,
  title = 'Titulo',
  ariaLabel,
  goBack = false,
}: {
  children: ReactNode
  onClose: () => void
  fullScreen?: boolean
  title: string
  ariaLabel?: string
  goBack?: boolean
}) {
  const navigate = useNavigate()

  const NavigateBack = () => {
    navigate('')
  }

  // const handleKeyDown = (event: any) => {
  //   if (!isOpen || event.key !== 'Escape') return

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
  // }, [isOpen])

  // const submit = useSubmit()
  // function handleChange(event: React.FormEvent<HTMLFormElement>) {
  //   submit(event.currentTarget, {replace: true})
  // }

  return (
    <motion.main
      className="bg-backdrop fixed  inset-0 z-50 flex max-h-screen flex-row items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm backdrop-filter"
      onClick={onClose}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <AnimatePresence>
        <motion.dialog
          className={clsx(
            'no-scrollbar  inset-x-0 bottom-0 m-0 mx-auto flex max-h-full w-full flex-col justify-between overflow-auto rounded-t-lg bg-white p-0',
            fullScreen && ' top-0 h-full',
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
          <div className="sticky inset-x-0 top-0 mb-2 flex w-full flex-row items-center justify-between border-b-2 bg-white p-4">
            {goBack ? (
              <Button onClick={NavigateBack} size="small">
                <IoMdArrowBack />
              </Button>
            ) : (
              <div />
            )}
            {title}
            <XIcon
              className="h-7 w-7 rounded-full p-1 shadow-lg dark:text-night-700"
              onClick={onClose}
            />
          </div>
          {children}
        </motion.dialog>
      </AnimatePresence>
    </motion.main>
  )
}
