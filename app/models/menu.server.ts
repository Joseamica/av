import {prisma} from '~/db.server'
import {getHour} from '~/utils'

export function getMenu(branchId: string | undefined) {
  const timeNow = getHour()

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
