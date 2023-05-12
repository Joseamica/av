import {prisma} from '~/db.server'

export function getMenu(branchId: string | undefined) {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  const timeNow = Number(`${hours}.${String(minutes).padStart(2, '0')}`)

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
