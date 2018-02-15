const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request-promise-native')

function pick (o, ...props) {
  return Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})))
}

module.exports = (() => {
  // Private data
  let req

  // Private methods
  async function getSessionCookie () {
    if (!fs.existsSync('sessionCookie.json')) {
      const browser = await puppeteer.launch({ headless: false })
      const page = await browser.newPage()

      await page.goto('http://192.168.10.2/admin')
      const agreeBtn = await page.$('input[type=submit]')
      await agreeBtn.click()
      await page.waitFor('#space-list')

      const [ sessionCookie ] = await page.cookies()
      fs.writeFileSync('sessionCookie.json', JSON.stringify(sessionCookie))

      await browser.close()
    }

    return fs.readFileSync('sessionCookie.json', 'utf-8')
  }

  const sdk = {
    // Public data

    // Public methods
    configure: async () => {
      if (!req) {
        // const sessionCookie = await getSessionCookie()
        req = request.defaults({
          baseUrl: 'http://192.168.10.2/admin/api',
          // Cookie: `${sessionCookie.name}=${sessionCookie.value}`
        })
      }
    },

    spaces (idOrProps) {
      function transform (json) {
        return pick(json,
          'id',
          'name',
          'mode',
          'areZonesDisabled',
          'state',
          'level',
          'kelvin',
          'hasTunableLights',
          'minimumKelvin',
          'maximumKelvin'
        )
      }
      if (idOrProps) {
        let base
        if (typeof idOrProps === 'object') {
          base = transform(idOrProps)
        } else if (typeof idOrProps === 'number') {
          base = { id: idOrProps }
        }
        return Object.assign(base, {
          fetch () {
            return req.get(`/spaces/${this.id}`).then(JSON.parse).then(data => {
              Object.assign(this, transform(data))
            })
          },
          turnoff () {
            return req.post(`/spaces/${this.id}/turnoff`)
          },
          turnon () {
            return req.post(`/spaces/${this.id}/turnon`)
          }
        })
      } else {
        return req.get('/spaces').then(JSON.parse).then(data => {
          return data.list.map(space => sdk.spaces(space))
        })
      }
    }
  }

  return sdk
})()
