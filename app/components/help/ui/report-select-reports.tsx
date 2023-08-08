import { useState } from 'react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '../../ui/buttons/button'
import { H3, H4 } from '../../util/typography'

import { Spacer } from '~/components'

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
      <motion.div className={clsx(' rounded-xl')}>
        <Spacer spaceY="0" size="md" />
        <H4>
          Selecciona cual fue el problema <span className="text-red-500">*</span>
        </H4>
        <Spacer spaceY="0" size="md" />

        {Object.entries(subjects).map(([key, value]: [string, string]) => (
          <Button
            // to={`?by=place&subject=${value}`}
            custom="border-2 border-warning "
            type="button"
            onClick={() => toggleReport(value)}
            key={key}
            size="small"
            className={clsx('mx-1', { 'fill-warning': error })}
            variant={reports.includes(value) ? 'primary' : error ? 'custom' : 'secondary'}
          >
            {value}
          </Button>
        ))}
        <input type="hidden" name="reports" value={reports || ''} />
      </motion.div>
    </AnimatePresence>
  )
}
