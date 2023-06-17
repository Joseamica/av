import {motion} from 'framer-motion'

interface SwitchButtonProps {
  state: boolean
  setToggle: (value: boolean) => void
  leftText?: string
  rightText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  stretch?: boolean
  size?: 'small' | 'medium' | 'large'
}

const sizes = {
  small: 'w-1/4',
  medium: 'w-3/4',
  large: 'w-full',
}

const DisplayTextAndIcon = ({
  icon,
  text,
}: {
  icon: React.ReactNode
  text?: string
}) => (
  <div className="flex max-h-7 flex-row items-center justify-center space-x-2">
    {/* <i className="flex h-5 w-5 items-center text-white">{icon}</i> */}
    {text && <h4 className="text-clip text-white">{text}</h4>}
  </div>
)

export function SwitchButton({
  state,
  setToggle,
  leftText,
  rightText,
  leftIcon,
  rightIcon,
  stretch,
  size = 'large',
}: SwitchButtonProps) {
  const commonClasses =
    'w-1/2 text-white flex flex-row justify-center items-center space-x-2'

  const toggleSwitch = () => setToggle(!state)

  const renderActiveButton = () =>
    state &&
    stretch && (
      <div className={commonClasses}>
        <DisplayTextAndIcon icon={leftIcon} text={leftText} />
      </div>
    )

  const renderInactiveButton = () =>
    !state &&
    stretch && (
      <div className={commonClasses}>
        <DisplayTextAndIcon icon={rightIcon} text={rightText} />
      </div>
    )

  return (
    <motion.button
      className={`flex ${
        sizes[size]
      } cursor-pointer rounded-full bg-button-notSelected p-1 shadow-inner ${
        state && 'place-content-end'
      }`}
      onClick={toggleSwitch}
    >
      {renderActiveButton()}

      <motion.div
        layout
        onClick={toggleSwitch}
        transition={{type: 'spring', stiffness: 700, damping: 25}}
        className={`flex h-7 w-1/2 flex-shrink-0 items-center justify-center rounded-full bg-button-primary`}
      >
        <DisplayTextAndIcon
          icon={state ? rightIcon : leftIcon}
          text={stretch ? (state ? rightText : leftText) : undefined}
        />
      </motion.div>

      {renderInactiveButton()}
    </motion.button>
  )
}
