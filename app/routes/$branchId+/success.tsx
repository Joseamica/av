import { Link, useLoaderData, useSearchParams } from '@remix-run/react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'

import { FlexRow, H2, H3, H4, H6, Spacer } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const employeeId = searchParams.get('employeeId')
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  })
  return json({ employee })
}

const SuccessPage = () => {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()
  const active = searchParams.get('active')

  return (
    <div className="flex flex-col items-center justify-center h-screen mx-auto">
      <h1 className="text-4xl font-bold mb-4">Éxito!</h1>
      <p>
        {data.employee?.name} ahora te encuentras:{' '}
        <span className="text-lg mb-8">
          {active === 'true' ? (
            <span className="text-white bg-success rounded-full px-2">Activo</span>
          ) : (
            <span className="text-white bg-warning rounded-full px-2">Inactivo</span>
          )}
        </span>
      </p>
      <Spacer size="sm" />
      <div className="bg-gray-100 rounded-xl border p-2">
        <H2>Continua con estas instrucciones:</H2>
        <Spacer size="sm" />

        <ol>
          <li className="flex flex-row">
            1.
            <Link
              to={`https://api.whatsapp.com/send/?phone=%2B14155238886&text=${
                active === 'true' ? 'join+describe-angle' : 'stop'
              }&type=phone_number&app_absent=0`}
              className="underline"
            >
              {' '}
              Click aquí
            </Link>
          </li>
          <li>2. Se te abrirá una conversación de Whatsapp</li>
          {active === 'true' ? (
            <>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/twilioss.png?alt=media&token=d26bfd70-8540-4a77-b1f5-cc20ca02d930"
                className="w-56 place-self-center"
                alt="Screenshot 2021-10-16 at 17.58.24"
              />
              <li>
                3. Manda el mensaje <span className="border rounded-full px-2 font-bold">join describe-angle</span>
              </li>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/Screenshot%202023-10-16%20at%2017.58.24.jpeg?alt=media&token=04856802-d426-4d67-aacb-8397cd2e20ff"
                className="w-56 place-self-center"
                alt="Screenshot 2021-10-16 at 17.58.24"
              />
            </>
          ) : (
            <>
              <li>
                3. Manda el mensaje <span className="border rounded-full px-2 font-bold">stop</span>
              </li>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/stoptwilio.jpeg?alt=media&token=ba92fdf8-aab5-423b-ac1a-76b9c60eac5d
              "
                className="w-56 place-self-center"
                alt="Screenshot 2021-10-16 at 17.58.24"
              />
            </>
          )}
          <li>4. Listo.</li>
        </ol>
      </div>

      {/* <Link to="/" className="text-blue-500 hover:underline">
        Go back to home page
      </Link> */}
    </div>
  )
}

export default SuccessPage
