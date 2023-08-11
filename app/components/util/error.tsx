import { Link } from '@remix-run/react'
import { FaExclamationCircle } from 'react-icons/fa'

import { FlexRow } from './flexrow'

function Error({ title, children }) {
  return (
    <div className="error">
      <FlexRow>
        <FaExclamationCircle fill="red" />
        <h2>{title}</h2>
      </FlexRow>
      Back to <Link to={'..'}> safety! </Link>
      {children}
    </div>
  )
}

export default Error
