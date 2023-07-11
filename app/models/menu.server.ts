import { prisma } from "~/db.server";

export function getHour() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Returns a string in the "HH:MM" format
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function getDayOfWeek() {
  const date = new Date();
  let day = date.getDay();

  if (day === 0) {
    // if it's Sunday
    day = 7; // make it 7
  }

  return day;
}

export function getMenu(branchId: string | undefined) {
  const timeNow = getHour();
  const dayOfWeekNow = getDayOfWeek();

  return prisma.menu.findFirst({
    where: {
      branchId,
      availabilities: {
        some: {
          dayOfWeek: dayOfWeekNow,
          OR: [
            {
              AND: [
                {
                  startTime: {
                    lte: String(timeNow),
                  },
                },
                {
                  endTime: {
                    gte: String(timeNow),
                  },
                },
              ],
            },
            {
              AND: [
                {
                  startTime: {
                    lte: String(timeNow),
                  },
                },
                {
                  endTime: {
                    gte: String(timeNow),
                  },
                },
              ],
            },
          ],
        },
      },
    },
    include: {
      availabilities: true,
    },
  });
}
