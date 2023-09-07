import { conform, useForm } from '@conform-to/react'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import { useRouteLoaderData } from 'react-router'

import { type ActionArgs, LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, Spacer } from '~/components'
import { ScrollableQueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { Field } from '~/components/admin/ui/forms'
import { EditIcon } from '~/components/icons'

const timezoneFormat = z.string().refine(
  value => {
    const validFormat = value
      .split('/')
      .every(part => part.split('_').every(subPart => subPart.charAt(0).toUpperCase() === subPart.charAt(0) && !subPart.includes(' ')))

    return validFormat
  },
  { message: 'Timezone must have all first letters capitalized, no spaces, and use underscores.' },
)

const branchSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  image: z.string().trim().url().optional(),
  address: z.string().min(1).max(200),
  extraAddress: z.string().min(1).max(50),
  city: z.string().min(1).max(50),
  timezone: timezoneFormat,
  phone: z.string().min(1).max(50),
  email: z.string().email(),
  language: z.string().min(1).max(2),
  cuisine: z.string().min(1).max(15),
  wifiName: z.string().min(1).max(50),
  wifiPwd: z.string().min(1).max(50),
  tipsPercentages: z.string().refine(str => /^(\d{2},)*\d{2}$/.test(str), { message: 'Must be two-digit numbers separated by commas' }),
  paymentMethods: z.array(z.string()),
})

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params
  const branch = await prisma.branch.findUnique({
    where: {
      id: branchId,
    },
  })
  return json({ branch })
}

export async function action({ request, params }: ActionArgs) {
  const { branchId } = params
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: branchSchema,
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }
  const tipsArray = submission.value.tipsPercentages.split(',').map(Number)

  await prisma.branch.update({
    where: { id: branchId },
    data: {
      name: submission.value.name,
      image: submission.value.image,
      address: submission.value.address,
      extraAddress: submission.value.extraAddress,
      city: submission.value.city,
      timezone: submission.value.timezone,
      phone: submission.value.phone,
      email: submission.value.email,
      language: submission.value.language,
      cuisine: submission.value.cuisine,
      wifiName: submission.value.wifiName,
      wifiPwd: submission.value.wifiPwd,
      tipsPercentages: tipsArray,
      paymentMethods: submission.value.paymentMethods,
    },
  })

  return redirect('')
}

export default function Index() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const data = useLoaderData()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams, setSearchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'branch',
    constraint: getFieldsetConstraint(branchSchema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: branchSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const editItem = searchParams.get('editItem')

  return (
    <div className="bg-gray-100 p-10">
      <div className="max-w-7xl mx-auto">
        <div key={data.branch.id} className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <button
            onClick={() => {
              searchParams.set('editItem', data.branch.id)
              setSearchParams(searchParams)
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded absolute top-4 right-4 hover:bg-blue-600"
          >
            <EditIcon />
          </button>
          <div className="flex flex-wrap -m-4">
            <div className="w-full lg:w-1/2 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Name</h2>
                <h1 className="text-xl">{data.branch.name}</h1>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Address</h2>
                <p>{data.branch.address}</p>
                <p>{data.branch.extraAddress}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">City</h2>
                <p>{data.branch.city}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Phone</h2>
                <p>{data.branch.phone}</p>
              </div>
            </div>
            <div className="w-full lg:w-1/2 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Cuisine</h2>
                <p>{data.branch.cuisine}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Wifi</h2>
                <p>Name: {data.branch.wifiName}</p>
                <p>Pwd: {data.branch.wifiPwd}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Tip Percentages</h2>
                {data.branch.tipsPercentages.map((tip, index) => (
                  <div key={index} className="p-1">
                    {tip}%
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-bold">Payment Methods</h2>
                {data.branch.paymentMethods.map((pm, index) => (
                  <div key={index} className="p-1">
                    {pm.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollableQueryDialog query="editItem" title="Edit">
        <fetcher.Form method="POST" className="" {...form.props}>
          <Field
            labelProps={{ children: 'Name' }}
            inputProps={{
              ...conform.input(fields.name, { type: 'text' }),
              required: true,
              defaultValue: data.branch ? data.branch.name : '',
            }}
            errors={[fields?.name.errors]}
          />
          {/* <Field
            labelProps={{ children: 'Image' }}
            inputProps={{
              ...conform.input(fields.image, { type: 'url' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.image,
            }}
            errors={[fields?.image.errors]}
          />
          <Field
            labelProps={{ children: 'Address' }}
            inputProps={{
              ...conform.input(fields.address, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.address,
            }}
            errors={[fields?.address.errors]}
          />
          <Field
            labelProps={{ children: 'Extra Address' }}
            inputProps={{
              ...conform.input(fields.extraAddress, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.extraAddress,
            }}
            errors={[fields?.extraAddress.errors]}
          />
          <Field
            labelProps={{ children: 'City' }}
            inputProps={{
              ...conform.input(fields.city, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.city,
            }}
            errors={[fields?.city.errors]}
          />
          <Link to="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" className="text-zinc-300 text-xs">
            Click here to see timezone reference
          </Link>
          <Field
            labelProps={{ children: `Timezone` }}
            inputProps={{
              ...conform.input(fields.timezone, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.timezone,
              placeholder: 'America/New_York',
            }}
            errors={fields?.timezone.errors}
          />
          <Field
            labelProps={{ children: 'Phone' }}
            inputProps={{
              ...conform.input(fields.phone, { type: 'phone' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.phone,
            }}
            errors={[fields?.phone.errors]}
          />
          <Field
            labelProps={{ children: 'Email' }}
            inputProps={{
              ...conform.input(fields.email, { type: 'email' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.email,
            }}
            errors={[fields?.email.errors]}
          />
          <Field
            labelProps={{ children: 'Language' }}
            inputProps={{
              ...conform.input(fields.language, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.language,
            }}
            errors={[fields?.language.errors]}
          />
          <Field
            labelProps={{ children: 'Type of Cuisine' }}
            inputProps={{
              ...conform.input(fields.cuisine, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.cuisine,
            }}
            errors={[fields?.cuisine.errors]}
          />
          <Field
            labelProps={{ children: 'Wifi Name' }}
            inputProps={{
              ...conform.input(fields.wifiName, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.wifiName,
            }}
            errors={[fields?.wifiName.errors]}
          />
          <Field
            labelProps={{ children: 'Wifi Password' }}
            inputProps={{
              ...conform.input(fields.wifiPwd, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.wifiPwd,
            }}
            errors={[fields?.wifiPwd.errors]}
          />
          <Field
            labelProps={{ children: 'Tip Percentages' }}
            inputProps={{
              ...conform.input(fields.tipsPercentages, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.tipsPercentages,
              pattern: '^(d{2},)*d{2}$', // Adding pattern attribute to enforce the format client-side
            }}
            errors={[fields?.tipsPercentages.errors]}
          />
          <Field
            labelProps={{ children: 'Payment Methods' }}
            inputProps={{
              ...conform.input(fields.paymentMethods, { type: 'text' }),
              required: true,
              defaultValue: branch.branches.find(branch => branch.id === editItem)?.paymentMethods,
            }}
            errors={[fields?.paymentMethods.errors]}
          /> */}
          <Spacer size="md" />
          <Button size="medium" type="submit" variant="secondary">
            {isSubmitting ? 'Editing branch...' : 'Edit branch'}
          </Button>

          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>
    </div>
  )
}
