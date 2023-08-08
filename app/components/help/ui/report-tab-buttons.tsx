export const Tab = ({ label, query, activeTab, setActiveTab }) => {
  const isActive = query === activeTab
  const active =
    'flex bg-day-principal h-12 w-1/4 justify-center items-center text-white text-lg rounded-xl font-medium shrink-0 transition-all duration-200 ease-in-out'
  const inactive =
    'flex h-12 w-1/4 justify-center items-center text-button-textNotSelected text-sm  shrink-0 transition-all duration-200 ease-in-out hover:bg-gray-200'

  const className = isActive ? active : inactive

  return (
    <div onClick={() => setActiveTab(query)} className={className}>
      {label}
    </div>
  )
}
