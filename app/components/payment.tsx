import {Button} from './buttons/button'
import {H1} from './util/typography'

export function Payment({
  total = 0,
  tip = total * (15 / 100),
}: {
  total: number
  tip: number
}) {
  return (
    <div>
      {/* Radio Tip buttons */}
      <input type="radio" name="tipPercentage" value="10" /> 10%
      <input type="radio" name="tipPercentage" value="15" defaultChecked /> 15%
      <input type="radio" name="tipPercentage" value="20" /> 20%
      {/* Total, propina, total */}
      <H1>Total: ${Number(total).toFixed(1)}</H1>
      <H1>Propina: ${Number(tip).toFixed(1)}</H1>
      <Button name="_action" value="proceed">
        Submit
      </Button>
    </div>
  )
}
