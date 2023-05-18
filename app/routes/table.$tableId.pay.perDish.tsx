import React from 'react'
import {useNavigate} from '@remix-run/react'
import {Modal} from '~/components/modal'

export default function PerDish() {
  const navigate = useNavigate()
  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Dividir por platillo"
    >
      <div>PerPerson</div>
    </Modal>
  )
}
