const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request-promise-native')

module.exports = (() => {
  // Private data
  let req

  // Private methods
  async function getSessionCookie () {
    if (!fs.existsSync('sessionCookie.json')) {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto('http://192.168.10.2/admin')
      const agreeBtn = await page.$('input[type=submit]')
      await agreeBtn.click()
      await page.waitForNavigation({ waitUntil: 'networkidle2' })

      const [ sessionCookie ] = await page.cookies()
      // wow, ok, this code is actually just writing 'utf-8' as the session cookie
      // and believe it or not, the admin api still works. so there is *no security*
      fs.writeFileSync('sessionCookie.json', 'utf-8')
    }

    return fs.readFileSync('sessionCookie.json', 'utf-8')
  }

  const sdk = {
    // Public data

    // Public methods
    configure: async () => {
      if (!req) {
        const sessionCookie = await getSessionCookie()
        req = request.defaults({
          baseUrl: 'http://192.168.10.2/admin/api',
          Cookie: `${sessionCookie.name}=${sessionCookie.value}`
        })
      }
    },

    spaces: (id) => {
      return {
        turnoff: () => {
          return req.post(`/spaces/${id}/turnoff`)
        },
        turnon: () => {
          return req.post(`/spaces/${id}/turnon`)
        }
      }
    }
  }

  return sdk
})()
