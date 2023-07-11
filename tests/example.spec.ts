import {test, expect} from '@playwright/test'

// test('has title', async ({page}) => {
//   await page.goto('https://localhost:3000')

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/)
// })

test('get started link', async ({page}) => {
  await page.goto('https://av.fly.dev/t')

  // Click the get started link.
  await page.getByRole('link', {name: '1'}).click()

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*table/)
})
