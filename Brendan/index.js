// const sdk = require('./sdk.js')

// ;(async () => {
//   await sdk.configure()
//   const spaces = [ sdk.spaces(1), sdk.spaces(2) ]
//   async function turnOff () {
//     spaces.forEach(async (space) => await space.turnoff())
//     // setTimeout(turnOn, 2000)
//   }
//   async function turnOn () {
//     spaces.forEach(async (space) => await space.turnon())
//     // setTimeout(turnOff, 2000)
//   }
//   async function disco1 () {
//     await Promise.all([ spaces[0].turnoff(), spaces[1].turnon() ])
//     setTimeout(disco2, 1000 * Math.random() + 1000)
//   }
//   async function disco2 () {
//     await Promise.all([ spaces[0].turnon(), spaces[1].turnoff() ])
//     setTimeout(disco1, 1000 * Math.random() + 1000)
//   }

//   // turnOn()
//   // (await sdk.spaces()).forEach(space => space.turnon())
//   const space = sdk.spaces({ id: 1, memes: 'hella' })
//   console.log(space)
//   await space.fetch()
//   console.log(space)
// })()

const GatewaySoftwareApi = require('gateway_software_api')

const api = new GatewaySoftwareApi.SpacesApi()

// api.spacesTurnOff(1, (err, data, response) => {
//   if (err) {
//     console.error(err)
//   } else {
//     console.log(data)
//   }
// })

api.spacesGetTimer(1, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    console.log(data)
  }
})
