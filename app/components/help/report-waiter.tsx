import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

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
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
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
        <Spacer spaceY="2" />

        <ReportSelections subjects={subjects} error={error} />

        <SendComments />

        <Spacer spaceY="2" />
      </div>
    </AnimatePresence>
  )
}
