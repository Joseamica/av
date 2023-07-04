import {json, redirect} from '@remix-run/node'
import {prisma} from '~/db.server'

export const loader = async ({request}: LoaderArgs) => {
  const rawData = await request.text()

  const url =
    'https://api.staging.deliverect.com/locations?sort=-_created&max_results=500&cursor=new&where={"account":"649c4c00c18d406de4aa0d50"}'
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization:
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImdDN25CdHNHQmVFRzZlRXIifQ.eyJpc3MiOiJodHRwczovL2FwaS5zdGFnaW5nLmRlbGl2ZXJlY3QuY29tIiwiYXVkIjoiaHR0cHM6Ly9hcGkuZGVsaXZlcmVjdC5jb20iLCJleHAiOjE2ODg0MTk1NzgsImlhdCI6MTY4ODMzMzE3OCwic3ViIjoiMHM1WDhUdTd3SFJvOUtPQUBjbGllbnRzIiwiYXpwIjoiMHM1WDhUdTd3SFJvOUtPQSIsInNjb3BlIjoiZ2VuZXJpY0NoYW5uZWw6am9zZWFudG9uaW9hbWlldmEifQ.sI2pLfIEMAIrb1GQ9v1R2vE0KwjIH5O3vkg5YhrenLCqdUxpf2Cm7zspyWPNrTxqYBEusG90seN4ErfVz86ObV69oYTQxlH2G1VDSkBTaeuwXS_wYxj18SQsdR4X9x0cUMvS5Wu4eZCnZNsTXEfUv3ypu_R3l_QFqN1tPgIiKyo-_ld1Z1_pSkR4sOp3RLO7ZdHL4Oi2O71nR1_NsXoO_tDMl2hYec46nJHulq0GTErAMTxyL6tI7_ZO_miJTyxwdcniPO82YRmksKiIQTTkAVwoAZhH2DGzjHIzTtz6Qrxs8-AjVzzUqiNGpfIoWBW9KDDu61BxKoayENH0ZLQ7Rw',
    },
  }
  const response = await fetch(url, options)
  const data = await response.json()
  const dataItems = data._items
  console.log('dataItems', dataItems)

  for (const item of dataItems) {
    const {_id, name, address, currency, timezone, channelLinkIds} = item
    await prisma.branch.upsert({
      where: {id: _id},
      update: {
        ppt_image: 'empty',
        city: item.address.city,
        cuisine: item.cuisine || 'empty',
        name: item.address.restaurantName,
        address: item.address.street || 'empty',
        timezone: item.timezone,
        email: item.contact.email || 'empty',
        phone: item.contact.phoneNumber || 'empty',
        extraAddress: item.address.postalCode,
      },
      create: {
        id: _id,
        ppt_image: 'empty',
        city: item.address.city,
        cuisine: item.cuisine || 'empty',
        name: item.address.restaurantName,
        address: item.address.street || 'empty',
        timezone: item.timezone,
        email: item.contact.email || 'empty',
        phone: item.contact.phoneNumber || 'empty',
        extraAddress: item.address.postalCode,

        // restaurantId: 'empty',
      },
    })
  }

  return json({success: true})
}

export const action = async ({request}: ActionArgs) => {
  const rawData = await request.text()
  const [menu] = JSON.parse(rawData)
  const channelLinkId = menu.channelLinkId
  const menuId = menu.menuId
  const currency = menu.currency
  const modifierGroups = menu.modifierGroups
  const modifiers = menu.modifiers
  const menuTranslations = menu.menuTranslations
  const products = menu.products
  const allergies = menu.productTags
  const availabilities = menu.availabilities

  // await prisma.menu.upsert({
  //   where: {id: menuId},
  //   update: {
  //     id: menuId,
  //   },
  //   create: {
  //     id: menuId,

  //   },
  // })

  // for (const availability of availabilities) {
  //   const {dayOfWeek, endTime, startTime} = availability
  //   const data = {
  //     dayOfWeek,
  //     endTime,
  //     startTime,
  //   }

  //   await prisma.availabilities.create({
  //     data,
  //   })
  // }

  const categories = menu.categories
  // console.log('menu', menu)
  // const body: any = { query };

  // if (variables) body.variables = variables;
  return redirect('')
}

// export default function apI() {
//   return <div>api</div>
// }
