// All code is free, use it.
// https://gist.github.com/magalhaespaulo/737a5c35048c18b8a2209d8a9fae977c

import ReactDOM from 'react-dom'
import {useEffect, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import FocusLock from 'react-focus-lock'
import {ChevronDownIcon, XIcon} from '@heroicons/react/outline'
import {FlexRow, Fragment, Spacer} from '.'
import {ChevronLeftIcon} from '@heroicons/react/solid'
import {H3} from './util/typography'
// import { Invisible } from "./invisible";

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

const Backdrop = ({
  children,
  handleClose,
}: {
  children: JSX.Element
  handleClose: () => void
}) => (
  <motion.div
    className="bg-backdrop fixed inset-0 z-50 flex max-h-screen flex-row items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm backdrop-filter"
    onClick={handleClose}
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
  >
    {children}
  </motion.div>
)

const ModalContent = ({
  className,
  children,
  handleClose,
  ariaLabel,
  imgHeader,
  noPadding,
  backButton,
  title,
  extend,
}: {
  className?: string
  children: JSX.Element
  handleClose: any
  ariaLabel: string
  imgHeader?: string
  noPadding?: boolean
  title: string
  backButton?: boolean
  extend?: boolean
}) => (
  <>
    <motion.div
      tabIndex={-1}
      role="dialog"
      aria-modal={true}
      aria-label={ariaLabel}
      className={`absolute  max-h-full ${
        extend ? 'h-full' : 'justify-between'
      } no-scrollbar inset-x-0  bottom-0 m-auto flex w-full max-w-md flex-col items-center overflow-hidden ${
        className || 'bg-background dark:bg-DARK_0 rounded-t-2xl     '
      }`}
      variants={effect}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={event => event.stopPropagation()}
    >
      {/* //~~>HEADERMODAL<~~// */}
      {handleClose && !imgHeader && (
        <div className="flex w-full">
          <FlexRow
            className={`dark:bg-mainDark w-full items-center justify-between bg-white drop-shadow-md    ${
              imgHeader ? null : 'p-4 shadow-inner'
            }`}
          >
            {/* {backButton ? null : ( */}
            <h3 className="xs:text-base text-xl font-medium">{title}</h3>
            {/* // )} */}
            <button
              onClick={handleClose}
              aria-label={`Close ${ariaLabel || 'dialog'}`}
              className={`${'xs:h-7 xs:w-7 text-principal dark:bg-secondaryDark dark:text-mainTextDark flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md dark:shadow-sm dark:shadow-black'} `}
            >
              <XIcon className="xs:w-4 xs:h-4 h-6 w-6" />
            </button>
          </FlexRow>
        </div>
      )}

      {/* //~~>If imgHeader<~~// */}
      {imgHeader && (
        <Fragment>
          <button
            onClick={handleClose}
            aria-label={`Close ${ariaLabel || 'dialog'}`}
            className={`${'text-principal dark:bg-secondaryDark dark:text-mainTextDark absolute right-5 top-5 flex h-10 w-10  items-center justify-center rounded-full bg-white shadow-md focus:border-0 focus:ring-0 dark:shadow-sm dark:shadow-black '}`}
          >
            <XIcon className="h-6 w-6" />
          </button>
          <img
            alt=""
            src={imgHeader}
            className="dark:bg-secondaryDark max-h-72 w-full rounded-t-lg bg-white object-cover"
            loading="lazy"
          />
        </Fragment>
      )}

      <div className="no-scrollbar w-full overflow-auto">{children}</div>
    </motion.div>
  </>
)

interface ModalProps {
  children: JSX.Element
  className?: string
  isOpen: boolean | {}
  handleClose?: any | (() => void)
  hideCloseButton?: boolean
  backdropDismiss?: boolean
  onExitComplete?: any
  ariaLabel?: any
  imgHeader?: string
  title?: string
  backButton?: boolean
  extend?: boolean
}

export const Modal = ({
  children,
  className,
  isOpen,
  handleClose,
  hideCloseButton,
  backdropDismiss = true,
  onExitComplete,
  ariaLabel,
  imgHeader,
  title,
  backButton,
  extend,
}: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false)
  const [trigger, setTrigger] = onExitComplete ?? [undefined, undefined]

  const handleKeyDown = (event: any) => {
    if (!isOpen || event.key !== 'Escape') return

    handleClose()
  }

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (!isBrowser) return <></>

  return ReactDOM.createPortal(
    <AnimatePresence
      initial={false}
      mode="wait"
      // exitBeforeEnter={true}
      onExitComplete={() =>
        setTrigger && trigger === 'fired' && setTrigger('completed')
      }
    >
      {isOpen && (
        <Backdrop handleClose={backdropDismiss ? handleClose : undefined}>
          <FocusLock>
            <ModalContent
              imgHeader={imgHeader}
              className={className}
              handleClose={hideCloseButton ? undefined : handleClose}
              ariaLabel={ariaLabel}
              title={title}
              backButton={backButton}
              extend={extend}
            >
              {children}
            </ModalContent>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root'),
  )
}

export const ModalFullScreen = ({
  children,
  className,
  isOpen,
  handleClose,
  hideCloseButton,
  backdropDismiss = true,
  onExitComplete,
  ariaLabel,
  imgHeader,
  title,
}: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false)
  const [trigger, setTrigger] = onExitComplete ?? [undefined, undefined]

  const handleKeyDown = (event: any) => {
    if (!isOpen || event.key !== 'Escape') return

    handleClose()
  }

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (!isBrowser) return <></>

  return ReactDOM.createPortal(
    <AnimatePresence
      initial={false}
      mode="wait"
      // exitBeforeEnter={true}
      onExitComplete={() =>
        setTrigger && trigger === 'fired' && setTrigger('completed')
      }
    >
      {isOpen && (
        <Backdrop handleClose={backdropDismiss ? handleClose : undefined}>
          <FocusLock>
            <motion.div
              tabIndex={-1}
              role="dialog"
              aria-modal={true}
              aria-label={ariaLabel}
              className={`fixed z-50 m-auto flex justify-center ${
                className ||
                'no-scrollbar  inset-0 h-full  w-screen max-w-md   items-center overflow-scroll'
              }`}
              variants={effect}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={event => event.stopPropagation()}
            >
              <div className="dark:bg-DARK_0 m-5 w-full rounded-xl bg-white p-5">
                {children}
              </div>
            </motion.div>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root'),
  )
}

export const RouteModal = ({
  children,
  className,
  isOpen,
  handleClose,
  hideCloseButton,
  backdropDismiss = true,
  onExitComplete,
  ariaLabel,
  imgHeader,
  title,
  backButton,
  extend,
}: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false)
  const [trigger, setTrigger] = onExitComplete ?? [undefined, undefined]

  const handleKeyDown = (event: any) => {
    if (!isOpen || event.key !== 'Escape') return

    handleClose()
  }

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (!isBrowser) return <></>

  return ReactDOM.createPortal(
    <AnimatePresence
      initial={false}
      mode="wait"
      // exitBeforeEnter={true}
      onExitComplete={() =>
        setTrigger && trigger === 'fired' && setTrigger('completed')
      }
    >
      {isOpen && (
        <Backdrop handleClose={backdropDismiss ? handleClose : undefined}>
          <FocusLock>
            <motion.div
              tabIndex={-1}
              role="dialog"
              aria-modal={true}
              aria-label={ariaLabel}
              className={`absolute  max-h-full ${
                extend ? 'h-full' : 'justify-between'
              } no-scrollbar inset-x-0  bottom-0 m-auto flex w-full max-w-md flex-col items-center overflow-hidden ${
                className || 'bg-background dark:bg-DARK_0 rounded-t-2xl     '
              }`}
              variants={effect}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={event => event.stopPropagation()}
            >
              {children}
            </motion.div>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root'),
  )
}
