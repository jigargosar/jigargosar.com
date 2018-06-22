describe('app', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000')
  })

  it('should display a react logo', async () => {
    await jestPuppeteer.debug()
    await expect(page).toMatch('ADD')
  })
})
