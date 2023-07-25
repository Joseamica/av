import {type CartItem} from '@prisma/client'
import {AnimatePresence, motion} from 'framer-motion'
import {CartItemDetails, H5, SectionContainer} from '..'

export function FilterOrderView({
  order,
  collapse,
  handleCollapse,
}: {
  order: any
  collapse: boolean
  handleCollapse: () => void
}) {
  return (
    <SectionContainer
      divider={true}
      showCollapse={order?.cartItems.length > 4 ? true : false}
      collapse={collapse}
      collapseTitle={
        collapse ? <H5>Ver más platillos</H5> : <H5>Ver menos platillos</H5>
      }
      handleCollapse={handleCollapse}
    >
      <AnimatePresence initial={false}>
        {(collapse ? order?.cartItems.slice(0, 4) : order?.cartItems).map(
          (cartItem: CartItem) => {
            return (
              <motion.div
                className="flex flex-col"
                key={cartItem.id}
                initial={{
                  opacity: 0,
                  height: '0',
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: '0',
                }}
                transition={{
                  opacity: {
                    duration: 0.2,
                    ease: [0.04, 0.62, 0.23, 0.98],
                  },
                  height: {
                    duration: 0.4,
                  },
                }}
              >
                <CartItemDetails cartItem={cartItem} />
              </motion.div>
            )
          },
        )}
      </AnimatePresence>
    </SectionContainer>
  )
}
