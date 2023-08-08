import { type CartItem } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'

import { ItemContainer } from '../containers/item-container'
import { Button, LinkButton } from '../ui/buttons/button'
import { Spacer } from '../util/spacer'
import { H2 } from '../util/typography'

export function ReportWaiter({ waiters, subjects, subject, submitButton, isSubmitting }) {
  return (
    <AnimatePresence>
      <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 1 }}>
        {waiters.map((waiter: CartItem) => (
          <ItemContainer key={waiter.id}>
            <label htmlFor={waiter.id} className="text-xl">
              {waiter.name}
            </label>
            <input id={waiter.id} type="checkbox" name="selected" value={waiter.id} className="h-5 w-5" />
          </ItemContainer>
        ))}
        <Spacer spaceY="2" />
        <H2>Selecciona cual fue el problema</H2>
        {Object.entries(subjects).map(([key, value]) => (
          <LinkButton size="small" to={`?by=waiter&subject=${value}`} key={key} variant={subject === value ? 'primary' : 'secondary'} className="mx-1">
            {value}
          </LinkButton>
        ))}
        <Spacer spaceY="2" />
        <Button name="_action" value="proceed" disabled={isSubmitting} className="w-full sticky bottom-0">
          {submitButton}
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}
