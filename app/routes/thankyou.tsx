import type {LoaderArgs} from '@remix-run/node'
import {H4} from '~/components'
export async function loader() {
  return null
}
export default function Thankyou() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="text-center">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/mascot-avocado-holding-banner-that-says-thank-you-cute-style-design-t-shirt-sticker-logo-element_152558-12394-removebg-preview.png?alt=media&token=ab7aba22-fff0-4096-99c4-c9581dda915f"
          alt="Thank you illustration"
          className="w-48 h-auto mx-auto mb-8"
        />
        <h1 className="text-2xl font-semibold dark:text-white">
          Gracias por usar los servicios de Avoqado!
        </h1>
        <H4 variant="secondary">
          Si quieres empezar una nueva orden, escanea el codigo QR que esta en
          tu mesa
        </H4>
      </div>
    </div>
  )
}
