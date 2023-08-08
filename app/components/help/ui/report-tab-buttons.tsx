export const Tab = ({ label, query, activeTab, setActiveTab, isFirst, isLast }) => {
  const isActive = query === activeTab
  const baseClass = 'flex h-12 w-1/4 justify-center items-center shrink-0 transition-all duration-200 ease-in-out'
  const active = baseClass + ' bg-day-principal text-white text-lg' + (isFirst ? ' rounded-l-xl' : isLast ? ' rounded-r-xl' : '')
  const inactive = baseClass + ' text-button-textNotSelected text-sm hover:bg-gray-200'

  const className = isActive ? active : inactive

  return (
    <div onClick={() => setActiveTab(query)} className={className}>
      {label}
    </div>
  )
}
