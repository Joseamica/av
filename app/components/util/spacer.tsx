const spacerSizes = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
}

function Spacer({
  className = '',
  children,
  spaceY = '2',
  size,
}: {
  className?: string
  children?: Array<JSX.Element> | JSX.Element
  spaceY?: string
  size?: keyof typeof spacerSizes
}) {
  return <div className={`py-${spaceY} ${spacerSizes[size]} ${className}  `}>{children}</div>
}

function SpacerBetweenItems({
  spaceY,
  size,
  className = '',
  children,
}: {
  spaceY: string
  size: keyof typeof spacerSizes
  className?: string
  children: Array<JSX.Element>
}) {
  return <div className={`space-y-${spaceY} ${className} ${spacerSizes[size]}`}>{children}</div>
}

export { Spacer, SpacerBetweenItems }
