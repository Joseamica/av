import {Form} from '@remix-run/react'
import {H1} from './util/typography'

export function Payment({total}: {total: number}) {
  return (
    <Form method="POST">
      {/* Radio Tip buttons */}
      <input type="radio" name="tip" value="10" /> 10%
      <input type="radio" name="tip" value="15" /> 15%
      <input type="radio" name="tip" value="20" /> 20%
      {/* Total, propina, total */}
      <H1>Total: ${total}</H1>
    </Form>
  )
}
