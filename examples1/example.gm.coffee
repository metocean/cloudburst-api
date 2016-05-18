logging = off

addCloudburstCGM = (json, host) ->

  map = new google.maps.Map(document.getElementById('map'),
    center:
      lat: 39.50
      lng: -98.35
    zoom: 5
  )
  cgm = new CloudburstMapType(json, host, map)
  map.overlayMapTypes.insertAt(0, cgm)

  # console.log CloudburstMapType()
  # map.mapTypes.set('cloudburst', new CloudburstMapType())
  # map.setMapTypeId('cloudburst')

  # cgm = new CloudburstGM(json, host)
  # cgm.setImageMapType({})
  #
  # map.overlayMapTypes.push(cgm.ImageMapType)

initMap = () ->

  cloudburst = new Cloudburst()
  callback = addCloudburstCGM
  cloudburst.loadConfiguration(callback)

initMap()
