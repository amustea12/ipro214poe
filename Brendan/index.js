// I'm pretty sure the Gateway API isn't configured properly for CORS.
// I'll ask their engineers what's up with that. Otherwise we can't use
// the sdk in the browser. Which would suck.
//
// const spacesApi = new window.GatewaySoftwareApi.SpacesApi()
// spacesApi.spacesGet((err, data) => {
//   if (err) {
//     console.error(err)
//   } else {
//     console.log(data)
//   }
// })

const spaceIds = []
fetch('http://192.168.10.2/admin/api/spaces').then(resp => resp.json()).then(json => {
  json.list.forEach(space => spaceIds.push(space.id))
}).catch(console.error.bind(console))

const lightSwitch = document.getElementById('switch')

lightSwitch.addEventListener('click', () => {
  if (lightSwitch.src.includes('switch-on.png')) {
    lightSwitch.src = 'switch-off.png'
    spaceIds.forEach(id => fetch(`http://192.168.10.2/admin/api/spaces/${id}/turnoff`, { method: 'POST' }))
  } else {
    lightSwitch.src = 'switch-on.png'
    spaceIds.forEach(id => fetch(`http://192.168.10.2/admin/api/spaces/${id}/turnon`, { method: 'POST' }))
  }
})
