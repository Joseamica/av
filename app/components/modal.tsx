import {XIcon} from '@heroicons/react/outline'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import type {ReactNode} from 'react'
import {Button, LinkButton} from './buttons/button'
import {Link, useNavigate} from '@remix-run/react'
import {IoMdArrowBack} from 'react-icons/io'

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
  return (
    <motion.main
      className="fixed inset-0 h-screen w-full bg-black bg-opacity-40"
      onClick={onClose}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <motion.dialog
        className={clsx(
          'fixed inset-x-0 bottom-0  max-h-full  min-h-max w-full overflow-auto rounded-t-lg bg-white dark:bg-night-500 dark:text-white',
          fullScreen && 'top-0 h-full',
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
        <div className="sticky top-0 mb-4 flex w-full flex-row justify-between bg-night-500">
          {goBack ? (
            <Button onClick={NavigateBack} size="small">
              <IoMdArrowBack />
            </Button>
          ) : (
            <div />
          )}
          {title}
          <XIcon
            className="h-7 w-7 rounded-full p-1 dark:bg-night-100 dark:text-night-700"
            onClick={onClose}
          />
        </div>
        {children}
      </motion.dialog>
    </motion.main>
  )
}
