import { SendComments } from '../send-comments'
import { H2 } from '../util/typography'

export function ReportOther() {
  return (
    <div className="space-y-2">
      <H2>
        Que sucedió? <span className="text-red-500">*</span>
      </H2>
      <SendComments />
    </div>
  )
}
