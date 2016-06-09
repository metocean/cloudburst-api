addCloudburstCGM = (json) ->

  map = new google.maps.Map(document.getElementById('map'),
    center:
      lat: 39.50
      lng: -98.35
    zoom: 5
  )

  layerid = 3
  for layer in json
    if layer.id.indexOf('1440') > -1
      # Prefer one of the rotation track layers, else just take the arbitrary default
      layerid = layer.id

  cloudburst.loadLayer(layerid).then (layer) ->
    cloudburst.loadInstance(layer.id, layer.instances[0].id).then (instance) ->
      cloudburst.loadTimes(layer.id, instance.id).then (times) ->
        cloudburst.loadLevels(layer.id, instance.id).then (levels) ->

          cgm = new CloudburstMapType(
            CBCONFIG.host + layer.resources.tile.replace('<instance>', instance.id), times, levels, layer.bounds, map
          )
          map.overlayMapTypes.insertAt(0, cgm)

cloudburst = new Cloudburst()
cloudburst.loadConfiguration(addCloudburstCGM)
