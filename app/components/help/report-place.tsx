import { AnimatePresence, motion } from 'framer-motion'

import { Spacer } from '..'
import { ReportSelections } from './ui/report-select-reports'

export function ReportPlace({ subjects }) {
  return (
    <AnimatePresence>
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
      >
        <ReportSelections subjects={subjects} />

        <Spacer spaceY="2" />
      </motion.div>
    </AnimatePresence>
  )
}
