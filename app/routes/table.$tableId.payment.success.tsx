import {type LoaderArgs, redirect} from '@remix-run/node'
import {EVENTS} from '~/events'
import {getSession, sessionStorage} from '~/session.server'

export const loader = async ({params, request}: LoaderArgs) => {
  const {tableId} = params
  const session = await getSession(request)
  session.unset('cart')
  session.flash('success', 'Pago realizado con éxito')
  EVENTS.ISSUE_CHANGED(tableId)

  return redirect(`/table/${tableId}`, {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}

// const PaymentSuccess = () => {
//   return (
//     <div>
//       <h1>Payment Cancelled!</h1>
//       <p>Thank you for your purchase.</p>
//     </div>
//   )
// }

// export default PaymentSuccess
