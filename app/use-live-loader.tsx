import {
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
} from '@remix-run/react'
import {useEffect} from 'react'
import {useEventSource} from 'remix-utils'

export function useLiveLoader<T>() {
  const eventName = useLocation().pathname
  const data = useEventSource(`/events${eventName}`)
  const navigate = useNavigate()
  const {revalidate} = useRevalidator()

  useEffect(() => {
    if (data === 'endOrder') {
      navigate('loader/endOrder')
    }

    revalidate()
  }, [data, revalidate])

  return useLoaderData<T>()
}
