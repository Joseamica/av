import {useNavigation, useSubmit} from '@remix-run/react'
import React from 'react'

export default function useSessionTimeout() {
  const submit = useSubmit()
  const navigation = useNavigation()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      submit(null, {method: 'POST', action: '/logout'})
    }, 18000000)
    return () => clearTimeout(timeout)
  }, [submit, navigation])
}
