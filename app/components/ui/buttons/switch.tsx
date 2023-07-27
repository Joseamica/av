import {motion} from 'framer-motion'
import {H4} from '../../util/typography'

const sizes = {
  small: 'w-1/4',
  medium: 'w-3/4',
  large: 'w-full',
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
}: {
  state: boolean
  setToggle: (boolean: boolean) => void
  leftText?: string
  rightText?: string
  leftIcon?: any
  rightIcon?: any
  stretch?: boolean
  size?: 'small' | 'medium' | 'large'
}) {
  const toggleSwitch = () => {
    if (typeof state === 'string') {
      return
    } else {
      setToggle(!state)
    }
  }
  return (
    <motion.button
      className={`flex  ${
        sizes[size]
      } h-16 cursor-pointer items-center rounded-2xl bg-button-notSelected p-1 shadow-inner hover:cursor-pointer ${
        state && 'place-content-end'
      }`}
      onClick={toggleSwitch}
    >
      {state ? (
        <div className="flex  w-1/2 flex-row items-center justify-center space-x-2 text-white">
          <i className="flex h-5 w-5 items-center text-zinc-400">{leftIcon}</i>
          {stretch ? <H4 className="text-zinc-400">{leftText}</H4> : null}
        </div>
      ) : null}

      <motion.div
        layout
        onClick={toggleSwitch}
        transition={{type: 'spring', stiffness: 700, damping: 25}}
        className={`bg-principal flex h-full w-1/2 items-center justify-center rounded-xl ${
          state ? 'bg-button-primary' : 'bg-button-primary'
        }`}
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
            <i className="flex h-5 w-5 items-center text-white">{leftIcon}</i>
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
