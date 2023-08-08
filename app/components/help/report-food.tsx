import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { H2, H4, ItemContainer, SendComments, Spacer } from '..'
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
      {cartItemsByUser.length > 0 ? (
        <div>
          <Spacer spaceY="0" size="md" />
          <H4>Selecciona los productos que deseas reportar</H4>
          <Spacer spaceY="0" size="md" />
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ x: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }, opacity: { duration: 0.1, ease: 'easeInOut' } }}
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
          </motion.div>
          <Spacer spaceY="0" size="md" />
          <ReportSelections subjects={subjects} error={error} />
          <Spacer spaceY="0" size="md" />
          <H4>Déjanos un comentario de lo sucedido</H4>
          <Spacer spaceY="0" size="md" />
          <SendComments />
        </div>
      ) : (
        <H2 className="text-center text-white rounded-full bg-warning">No cuentas con platillos para reportar</H2>
      )}
    </AnimatePresence>
  )
}
