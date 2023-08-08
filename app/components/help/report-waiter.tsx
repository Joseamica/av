import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { H4 } from '..'
import { ItemContainer } from '../containers/item-container'
import { SendComments } from '../send-comments'
import { Spacer } from '../util/spacer'
import { ReportSelections } from './ui/report-select-reports'

export function ReportWaiter({
  waiters,
  subjects,
  toggleSelected,
  error,
}: {
  waiters: any
  subjects: {}
  toggleSelected: (id: string) => void
  error?: string
}) {
  return (
    <AnimatePresence>
      <div>
        <Spacer spaceY="0" size="md" />
        <H4>Selecciona a los meseros que deseas reportar</H4>
        <Spacer spaceY="0" size="md" />
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ x: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }, opacity: { duration: 0.1, ease: 'easeInOut' } }}
        >
          {waiters.map((waiter: CartItem) => (
            <ItemContainer key={waiter.id}>
              <label htmlFor={waiter.id} className="text-lg">
                {waiter.name}
              </label>
              <input
                id={waiter.id}
                type="checkbox"
                name="selected"
                value={waiter.id}
                className="w-5 h-5"
                onClick={() => toggleSelected(waiter.id)}
              />
            </ItemContainer>
          ))}
        </motion.div>

        <Spacer spaceY="0" size="md" />

        <ReportSelections subjects={subjects} error={error} />

        <Spacer spaceY="0" size="md" />

        <H4>Déjanos un comentario de lo sucedido</H4>

        <Spacer spaceY="0" size="md" />

        <SendComments />
      </div>
    </AnimatePresence>
  )
}
