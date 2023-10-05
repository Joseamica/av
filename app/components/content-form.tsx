import { Form, Link } from '@remix-run/react'
import { useState } from 'react'

import { Button, ButtonLink } from './ui/buttons/button'
import { FlexRow } from './util/flexrow'
import { Spacer } from './util/spacer'
import { H4 } from './util/typography'

// * UTILS
import { getRandomColor } from '~/utils'

export function ContentForm({ errorClass, error, pathname }: { errorClass: string; error?: string; pathname: string }) {
  const [name, setName] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value)
  }

  const handleError = !name && error && error

  const randomColor = getRandomColor()

  return (
    <Form
      method="post"
      className="space-y-2 bg-day-bg_principal"
      // onChange={handleChange}
    >
      <div
        className={`flex w-full flex-row items-center bg-button-notSelected px-4 py-2 ${!name && errorClass} ${
          handleError && 'border-2 border-warning'
        }`}
      >
        <input
          type="text"
          name="name"
          autoCapitalize="words"
          id="name"
          value={name}
          autoFocus={true}
          className={`flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 ${
            !name && errorClass
          } `}
          placeholder="Nombre"
          onChange={e => handleChange(e)}
        />
      </div>
      {!name && error && (
        <H4 variant="error" className="pl-6">
          {error}
        </H4>
      )}

      <input type="hidden" name="url" value={pathname} />

      <div className="flex flex-col items-start justify-start p-4">
        <FlexRow>
          <label htmlFor="color" className="pl-4 text-3xl">
            Escoge tu color:
          </label>
          <div className="transparent h-10 w-10 overflow-hidden">
            <input type="color" name="color" id="color" defaultValue={randomColor} className="h-full w-full" />
          </div>
        </FlexRow>
        <Spacer spaceY="4" />
        <div className="w-full justify-center flex flex-col items-center">
          <Button fullWith={true} name="_action" value="proceed">
            Continuar a la mesa
          </Button>
          <Spacer spaceY="2">
            <span>ó</span>
          </Spacer>
          <ButtonLink to="/join" fullWith={true} variant="secondary">
            O puedes iniciar sesión aquí
          </ButtonLink>
        </div>
      </div>
    </Form>
  )
}
