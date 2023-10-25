import { prisma } from '~/db.server'

export async function dashboardGetBranchAndEmployee(employeeId: string) {
  if (!employeeId) {
    return { error: 'Employee not found' }
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  })
  if (!employee) {
    throw new Error('Employee not found')
  }
  const branch = await prisma.branch.findUnique({
    where: {
      id: employee.branchId,
    },
  })

  return { branch, employee }
}
