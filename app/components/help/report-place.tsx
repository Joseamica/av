import { AnimatePresence, motion } from 'framer-motion'

import { H4, SendComments, Spacer } from '..'
import { ReportSelections } from './ui/report-select-reports'

export function ReportPlace({ subjects, error }: { subjects: {}; error?: string }) {
  return (
    <AnimatePresence>
      <motion.div>
        <ReportSelections subjects={subjects} error={error} />

        <Spacer spaceY="0" size="md" />

        <H4>Déjanos un comentario de lo sucedido</H4>

        <Spacer spaceY="0" size="md" />

        <SendComments />
      </motion.div>
    </AnimatePresence>
  )
}
