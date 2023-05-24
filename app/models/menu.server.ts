import {prisma} from '~/db.server'
import {getDateTime} from '~/utils'

export function getMenu(branchId: string | undefined) {
  const timeNow = getDateTime()

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
          ],
        },
      ],
    },
  })
}
