import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import React, {useEffect, useState} from 'react'
import {PlusIcon} from './icons'
import {H3} from './util/typography'

function Notification({
  children,
  message,
  position = 'top',
  visibleMs = 4000,
}: {
  children?: React.ReactNode
  message: string
  position?: string
  visibleMs?: number
}) {
  const [isVisible, setIsVisible] = useState(message ? true : false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
    }
  }, [message])

  useEffect(() => {
    if (!message) return
    let timer: ReturnType<typeof setTimeout>
    if (message) {
      timer = setTimeout(() => {
        setIsVisible(false)
      }, visibleMs)
    }
    return () => clearTimeout(timer)
  }, [message, visibleMs])

  const show = isVisible

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{opacity: 0, y: -100}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -100}}
          transition={{ease: 'easeInOut', duration: 0.3}}
          className={clsx(
            `pointer-events-auto fixed  left-0 top-0 z-[9999] w-full bg-button-successBg py-2 text-center text-success`,
            {'top-0': position === 'top', 'bottom-0': position === 'bottom'},
          )}
        >
          <div className={clsx('mx-auto flex w-full')}>
            <button
              className="absolute right-4 top-2 rotate-45 transform"
              onClick={() => setIsVisible(false)}
            >
              <PlusIcon />
            </button>
            <H3 className="flex w-full justify-center">{message}</H3>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export {Notification}
