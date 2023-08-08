import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { ItemContainer } from '../containers/item-container'
import { Spacer } from '../util/spacer'
import { ReportSelections } from './ui/report-select-reports'

export function ReportWaiter({ waiters, subjects }) {
  return (
    <AnimatePresence>
      <motion.div>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          // exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {waiters.map((waiter: CartItem) => (
            <ItemContainer key={waiter.id}>
              <label htmlFor={waiter.id} className="text-lg">
                {waiter.name}
              </label>
              <input id={waiter.id} type="checkbox" name="selected" value={waiter.id} className="h-5 w-5" />
            </ItemContainer>
          ))}
        </motion.div>
        <Spacer spaceY="2" />

        <ReportSelections subjects={subjects} />

        <Spacer spaceY="2" />
      </motion.div>
    </AnimatePresence>
  )
}
