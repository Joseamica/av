import { useState } from 'react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '../../ui/buttons/button'
import { H2 } from '../../util/typography'

export function ReportSelections({ subjects, error }: { subjects: {}; error?: string }) {
  const [reports, setReports] = useState([])

  const toggleReport = value => {
    // Check if the value is already in the reports array
    if (reports.includes(value)) {
      // If it is, remove it
      setReports(reports.filter(report => report !== value))
    } else {
      // If it's not, add it
      setReports([...reports, value])
    }
  }
  return (
    <AnimatePresence>
      <motion.div
        className={clsx('space-y-2 bg-white rounded-xl p-2')}
        // initial={{ opacity: 0, height: -0 }}
        // animate={{ opacity: 1, height: 'auto' }}
        // exit={{ opacity: 0, y: 20 }}
        // transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <H2>
          Selecciona cual fue el problema <span className="text-red-500">*</span>
        </H2>
        {Object.entries(subjects).map(([key, value]: [string, string]) => (
          <Button
            // to={`?by=place&subject=${value}`}
            type="button"
            onClick={() => toggleReport(value)}
            key={key}
            size="small"
            className={clsx('mx-1', { 'fill-warning': error })}
            variant={reports.includes(value) ? 'primary' : error ? 'danger' : 'secondary'}
          >
            {value}
          </Button>
        ))}
        <input type="hidden" name="reports" value={reports || ''} />
      </motion.div>
    </AnimatePresence>
  )
}
