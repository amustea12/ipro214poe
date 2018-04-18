const spacesApi = new window.GatewaySoftwareApi.SpacesApi()
const spaceId = getParameterByName('id')

// Perform initialization of state from API
spacesApi.spacesGetLights(spaceId, (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  // Update on/off toggle
  if (data.list.some(light => light.level > 0)) {
    $('#unchecked').prop('checked', true)
  } else {
    $('#unchecked').prop('checked', false)
  }

  // Update overall brightness
  $('#brightness').val(data.list[0].level / 100)
  $('#brightness + .slider .slider-fill').css('width', `${data.list[0].level / 100}%`)
  $('#brightness + .slider .slider-handle').css('left', `${data.list[0].level / 100}%`)
  $('#brightness + .slider .slider-handle .slider-label span').text(data.list[0].level / 100)

  // Update color temperature
  if (data.list.every(light => light.kelvin === 0)) {
    $('#temp-card').addClass('disabled-card')
  } else {
    $('#intensity-slider').val(data.list[0].kelvin)
    const widthLeft = ((data.list[0].kelvin - parseInt($('#intensity-slider').attr('min'))) / (parseInt($('#intensity-slider').attr('max')) - parseInt($('#intensity-slider').attr('min'))))*100 +'%'
    $('#intensity-slider + .slider .slider-fill').css('width', widthLeft)
    $('#intensity-slider + .slider .slider-handle').css('left', widthLeft)
    $('#intensity-slider + .slider .slider-handle .slider-label span').text(data.list[0].kelvin)
  }
})

$('#unchecked').click(() => {
  if ($('#unchecked').prop('checked')) {
    spacesApi.spacesTurnOn(spaceId)
  } else {
    spacesApi.spacesTurnOff(spaceId)
  }
})

$('#brightness').on('change', () => {
  const dto = GatewaySoftwareApi.LightingDto.constructFromObject({ level: $('#brightness').val() * 100 })
  spacesApi.spacesLighting(spaceId, dto)
})

$('#intensity-slider').on('change', () => {
  const dto = GatewaySoftwareApi.LightingDto.constructFromObject({ kelvin: $('#intensity-slider').val() })
  spacesApi.spacesLighting(spaceId, dto)
})

function getParameterByName (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(() => {
  switch (getParameterByName('id')) {
    case '1':
      document.title = `School | ${document.title}`
      $('.room-id').text('School')
      break
    case '2':
      document.title = `Office | ${document.title}`
      $('.room-id').text('Office')
      $('#temp-card').hide()
      break
    default:
      document.title = `Room ${getParameterByName('id')} | ${document.title}`
      $('.room-id').text(`Room ${getParameterByName('id')}`)
      break
  }
})
