import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

export function createUsers() {
  const firstName = faker.name.firstName()
  const emails = faker.internet.email()
  const creationDates = faker.date.recent()
  return {
    name: firstName,
    email: emails,
    creationDate: creationDates,
  }
}

// export function createTables({}) {
//   return {
//     table_number: faker.datatype.number(),
//     order_in_progress: faker.datatype.boolean(),
//     branch,
//   }
// }
