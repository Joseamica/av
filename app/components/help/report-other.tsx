import { Spacer } from '..'
import { SendComments } from '../send-comments'
import { H4 } from '../util/typography'

export function ReportOther({ error }) {
  return (
    <div>
      <Spacer spaceY="0" size="md" />

      <H4>Déjanos un comentario de lo sucedido</H4>

      <Spacer spaceY="0" size="md" />

      <SendComments error={error} />
    </div>
  )
}
