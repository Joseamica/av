import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { H2, ItemContainer, SendComments, Spacer } from '..'
import { ReportSelections } from './ui/report-select-reports'

export function ReportFood({ cartItemsByUser, subjects }) {
  return (
    <AnimatePresence>
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        // exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {cartItemsByUser.length > 0 ? (
          <>
            {cartItemsByUser.map((cartItem: CartItem) => (
              <ItemContainer key={cartItem.id}>
                <label htmlFor={cartItem.id} className="text-lg">
                  {cartItem.name}
                </label>
                <input id={cartItem.id} type="checkbox" name="selected" value={cartItem.id} className="h-5 w-5" />
              </ItemContainer>
            ))}
            <Spacer spaceY="2" />

            <ReportSelections subjects={subjects} />

            <SendComments />

            <Spacer spaceY="2" />
          </>
        ) : (
          <H2 className="bg-warning text-center rounded-full text-white">No cuentas con platillos para reportar</H2>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
