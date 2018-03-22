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

// const lightSwitch = document.getElementById('switch')

// lightSwitch.addEventListener('click', () => {
//   if (lightSwitch.src.includes('switch-on.png')) {
//     lightSwitch.src = 'switch-off.png'
//     getSpaces().then(spaces => spaces.forEach(space => spacesApi.spacesTurnOff(space.id)))
//   } else {
//     lightSwitch.src = 'switch-on.png'
//     getSpaces().then(spaces => spaces.forEach(space => spacesApi.spacesTurnOn(space.id)))
//   }
// })

const slider = document.getElementById('slider')
slider.addEventListener('input', debounce(() => {
  if (slider.value === "0") {
    getSpaces().then(spaces => spaces.forEach(space => spacesApi.spacesTurnOff(space.id)))
  } else {
    const dto = GatewaySoftwareApi.LightingDto.constructFromObject({ level: parseInt(slider.value) * 100 })
    getSpaces().then(spaces => spaces.forEach(space => {
      spacesApi.spacesTurnOn(space.id)
      spacesApi.spacesLighting(space.id, dto)
    }))
  }
}, 300))

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
