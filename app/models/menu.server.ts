import {prisma} from '~/db.server'
import {getHour} from '~/utils'

// export function getMenu(branchId: string | undefined) {
//   const timeNow = getHour()

//   return prisma.menu.findFirst({
//     where: {
//       branchId,
//       OR: [
//         {
//           allday: true,
//         },
//         {
//           AND: [
//             {
//               fromHour: {
//                 lte: timeNow,
//               },
//             },
//             {
//               toHour: {
//                 gte: timeNow,
//               },
//             },
//           ],
//         },
//       ],
//     },
//   })
// }

function getDayOfWeek() {
  const date = new Date()
  let day = date.getDay()

  // Adjust day number to match your database format
  if (day === 0) {
    // if it's Sunday
    day = 7 // make it 7
  }

  return day
}

export function getMenu(branchId: string | undefined) {
  const timeNow = getHour()
  const dayOfWeekNow = getDayOfWeek()

  return prisma.menu.findFirst({
    where: {
      branchId,
      OR: [
        {
          allday: true,
        },
        {
          AND: [
            {
              fromHour: {
                lte: timeNow,
              },
            },
            {
              toHour: {
                gte: timeNow,
              },
            },
            {
              availabilities: {
                some: {
                  dayOfWeek: dayOfWeekNow,
                  startTime: {
                    lte: String(timeNow),
                  },
                  endTime: {
                    gte: String(timeNow),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      availabilities: true,
    },
  })
}
