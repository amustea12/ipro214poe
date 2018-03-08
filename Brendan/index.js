const spacesApi = new window.GatewaySoftwareApi.SpacesApi()

const getSpaces = (function () {
  let spaces
  return () => {
    if (!spaces) {
      return new Promise((resolve, reject) => {
        spacesApi.spacesGet((err, data) => {
          if (err) {
            reject(err)
          } else {
            spaces = data.list
            resolve(spaces)
          }
        })
      })
    } else {
      return Promise.resolve(spaces)
    }
  }
}())

const lightSwitch = document.getElementById('switch')

lightSwitch.addEventListener('click', () => {
  if (lightSwitch.src.includes('switch-on.png')) {
    lightSwitch.src = 'switch-off.png'
    getSpaces().then(spaces => spaces.forEach(space => spacesApi.spacesTurnOff(space.id)))
  } else {
    lightSwitch.src = 'switch-on.png'
    getSpaces().then(spaces => spaces.forEach(space => spacesApi.spacesTurnOn(space.id)))
  }
})
