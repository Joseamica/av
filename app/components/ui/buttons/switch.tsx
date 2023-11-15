import { motion } from 'framer-motion'

import { H4 } from '../../util/typography'

const sizes = {
  small: 'w-1/4',
  medium: 'w-3/4',
  large: 'w-full',
}

const heights = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-14',
}

const corners = {
  all: 'rounded-xl',
  top: 'rounded-t-xl',
  bottom: 'rounded-b-xl',
  none: '',
}

export function SwitchButton({
  state,
  setToggle,
  leftText,
  rightText,
  leftIcon,
  rightIcon,
  stretch,
  size = 'large',
  height = 'large',
  corner = 'all',
  allCornersRounded = true,
}: {
  state: boolean
  setToggle: (boolean: boolean) => void
  leftText?: string
  rightText?: string
  leftIcon?: any
  rightIcon?: any
  stretch?: boolean
  size?: 'small' | 'medium' | 'large'
  height?: 'small' | 'medium' | 'large'
  corner?: 'all' | 'top' | 'bottom' | 'none'
  allCornersRounded?: boolean
}) {
  const toggleSwitch = () => {
    if (typeof state === 'string') {
      return
    } else {
      setToggle(!state)
    }
  }
  return (
    // prettier-ignore
    <motion.button type="button" className={`flex  ${sizes[size]} ${heights[height]}  cursor-pointer items-center  ${corners[corner]} bg-button-notSelected rounded-lg shadow-inner hover:cursor-pointer ${state && 'place-content-end'}`}
      onClick={toggleSwitch}
    >
      {state ? (
        <div className="flex  w-1/2 flex-row items-center justify-center space-x-2 text-white">
          <i className="flex h-5 w-5 items-center fill-zinc-400 text-zinc-400">{leftIcon}</i>
          {stretch ? <H4 className="text-zinc-400">{leftText}</H4> : null}
        </div>
      ) : null}

      <motion.div
        layout
        onClick={toggleSwitch}
        transition={{type: 'spring', stiffness: 700, damping: 25}}
        className={`bg-principal flex h-full w-1/2 items-center justify-center ${
          allCornersRounded ? 'rounded-lg' : ' rounded-t-lg'
        } ${state ? 'bg-button-primary' : 'bg-button-primary'}`}
      >
        {/* ACTIVATED BUTTON */}
        {state ? (
          <div className="flex max-h-7 flex-row items-center justify-center space-x-2 text-white">
            <i className="flex h-5 w-5 items-center text-white">{rightIcon}</i>
            {stretch ? (
              <h4 className="text-clip text-white">{rightText}</h4>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-row items-center justify-center space-x-2 text-white">
            <i className="flex h-5 w-5 items-center fill-white">{leftIcon}</i>
            {stretch ? (
              <h4 className="text-clip text-white">{leftText}</h4>
            ) : null}
          </div>
        )}
      </motion.div>
      {!state && (
        <div className="flex w-1/2 flex-row items-center justify-center space-x-2 px-3 text-white">
          <i className="flex h-5 w-5 items-center text-zinc-400">{rightIcon}</i>
          {stretch ? <H4 className="text-zinc-400">{rightText}</H4> : null}
        </div>
      )}
    </motion.button>
  )
}
