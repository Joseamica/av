import {
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useSubmit,
} from '@remix-run/react'
import {useEffect} from 'react'
import {useEventSource} from 'remix-utils'

export function useLiveLoader<T>() {
  const eventName = useLocation().pathname

  const data = useEventSource(`/events${eventName}`)

  const navigate = useNavigate()
  const submit = useSubmit()
  const {revalidate} = useRevalidator()

  // FIXME- esto hace que cuando se hace save en vscode, se recarga la pagina multiples veces
  useEffect(() => {
    if (data) {
      switch (data) {
        case 'endOrder':
          // navigate('processes/endOrder')
          submit('', {method: 'POST', action: 'processes/endOrder'})
          break
      }

      revalidate()
    }
  }, [data, revalidate])

  return useLoaderData<T>()
}
