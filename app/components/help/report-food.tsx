import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { H2, ItemContainer, SendComments, Spacer } from '..'
import { ReportSelections } from './ui/report-select-reports'

export function ReportFood({
  cartItemsByUser,
  subjects,
  toggleSelected,
  error,
}: {
  cartItemsByUser: any
  subjects: {}
  toggleSelected: (id: string) => void
  error?: string
}) {
  return (
    <AnimatePresence>
      <div>
        {cartItemsByUser.length > 0 ? (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            // exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {cartItemsByUser.map((cartItem: CartItem) => (
              <ItemContainer key={cartItem.id}>
                <label htmlFor={cartItem.id} className="text-lg">
                  {cartItem.name}
                </label>
                <input
                  id={cartItem.id}
                  type="checkbox"
                  name="selected"
                  value={cartItem.id}
                  className="w-5 h-5"
                  onClick={() => toggleSelected(cartItem.id)}
                />
              </ItemContainer>
            ))}

            <Spacer spaceY="2" />

            <ReportSelections subjects={subjects} error={error} />

            <SendComments />

            <Spacer spaceY="2" />
          </motion.div>
        ) : (
          <H2 className="text-center text-white rounded-full bg-warning">No cuentas con platillos para reportar</H2>
        )}
      </div>
    </AnimatePresence>
  )
}
