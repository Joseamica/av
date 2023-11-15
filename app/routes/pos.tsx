import { useFetcher } from '@remix-run/react'
import { useState } from 'react'

import { json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'

import { FlexRow, Spacer } from '~/components'

export async function loader({ request, params }) {
  const session = await getSession(request)
  const employeeId = session.get('employeeId')
  if (employeeId) return redirect('/dashboard')
  return json({ success: true })
}

export async function action({ request, params }) {
  const session = await getSession(request)

  const formData = await request.formData()
  const code = formData.get('code')
  console.log('code', code)
  const isEmployee = await prisma.employee.findFirst({
    where: {
      code: code,
    },
  })
  if (!isEmployee) {
    return json({ error: 'Código Invalido' })
  } else {
    session.set('employeeId', isEmployee.id)
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    })
  }
}

export default function POS() {
  const fetcher = useFetcher()
  const [code, setCode] = useState('')

  const handleCode = c => {
    if (code.length <= 3) {
      setCode(code.toString() + c)
    }
  }

  return (
    <div className="overflow-y-hidden">
      <input
        type="password"
        inputMode="numeric"
        className="flex items-center justify-center w-full h-40 text-4xl text-center border disabled:opacity-100"
        value={code}
        disabled={true}
        maxLength={4}
        // You could also use onKeyDown or onInput to enforce the max length
      />
      <Spacer spaceY="2" />

      {/* <div>
        <div>
          {numbers.map(n => {
            if (n === 0) {
              return null
            }
            return (
              <button key={n} onClick={() => (number.length <= 5 ? setNumber(n + number.toString()) : null)} className="w-1/4 h-20 border">
                {n}
              </button>
            )
          })}
          <button onClick={() => setNumber(number.slice(0, -1))} className="w-20 h-20 border">
            Borrar
          </button>
        </div>
        <Spacer spaceY="2" />
        <div>
          <Button onClick={() => setNumber(number.slice(0, -1))}>Entrar</Button>
        </div>
      </div> */}
      <fetcher.Form method="POST" className="flex flex-col items-center justify-center w-full space-y-2">
        <FlexRow>
          <button onClick={() => handleCode('1')} className="w-[80px] h-[80px] border" type="button">
            1
          </button>
          <button onClick={() => handleCode('2')} className="w-[80px] h-[80px] border" type="button">
            2
          </button>
          <button onClick={() => handleCode('3')} className="w-[80px] h-[80px] border" type="button">
            3
          </button>
        </FlexRow>
        <FlexRow>
          <button onClick={() => handleCode('4')} className="w-[80px] h-[80px] border" type="button">
            4
          </button>
          <button onClick={() => handleCode('5')} className="w-[80px] h-[80px] border" type="button">
            5
          </button>
          <button onClick={() => handleCode('6')} className="w-[80px] h-[80px] border" type="button">
            6
          </button>
        </FlexRow>
        <FlexRow>
          <button onClick={() => handleCode('7')} className="w-[80px] h-[80px] border" type="button">
            7
          </button>
          <button onClick={() => handleCode('8')} className="w-[80px] h-[80px] border" type="button">
            8
          </button>
          <button onClick={() => handleCode('9')} className="w-[80px] h-[80px] border" type="button">
            9
          </button>
        </FlexRow>
        <FlexRow>
          <button
            onClick={() => setCode(code.slice(0, -1))}
            className="w-[80px] h-[80px] border bg-warning text-white disabled:opacity-40"
            type="button"
            disabled={code.length <= 0}
          >
            Borrar
          </button>
          <button onClick={() => handleCode('0')} className="w-[80px] h-[80px] border" type="button">
            0
          </button>
          <button
            className="w-[80px] h-[80px] border bg-day-principal text-white disabled:opacity-40"
            type="submit"
            disabled={code.length <= 3}
          >
            Enter
          </button>
        </FlexRow>
        <input type="hidden" name="code" value={code} />
      </fetcher.Form>
      {fetcher.data?.error && <p className="text-red-500">{fetcher.data.error}</p>}
    </div>
  )
}
