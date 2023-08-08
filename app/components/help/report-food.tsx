import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { Button, H1, H2, ItemContainer, LinkButton, Spacer } from '..'

export function ReportFood({ cartItemsByUser, subjects, isSubmitting, submitButton, subject }) {
  return (
    <AnimatePresence>
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
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

            <H1>Selecciona cual fue el problema</H1>
            {Object.entries(subjects).map(([key, value]) => (
              <LinkButton
                to={`?by=food&subject=${value}`}
                key={key}
                size="small"
                className="mx-1"
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Spacer spaceY="2" />
            <Button name="_action" value="proceed" disabled={isSubmitting} className="w-full">
              {submitButton}
            </Button>
          </>
        ) : (
          <H2 className="bg-warning text-center rounded-full text-white">No cuentas con platillos para reportar</H2>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
