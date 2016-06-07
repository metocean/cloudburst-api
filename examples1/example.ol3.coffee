change_header = (new_t) ->
  t = document.getElementById('time')
  if t?
    t.innerHTML = ": #{new_t}"
  return

init = () ->

  cloudburst = new Cloudburst()
  cloudburst.loadConfiguration().then (json) ->

    layerid = 3
    for layer in json
      if layer.id.indexOf('1440') > -1
        # Prefer one of the rotation track layers, else just take the arbitrary default
        layerid = layer.id

    cloudburst.loadLayer(layerid).then (layer) ->
      cloudburst.loadInstance(layer.id, layer.instances[0].id).then (instance) ->
        cloudburst.loadTimes(layer.id, instance.id).then (times) ->
          cloudburst.loadLevels(layer.id, instance.id).then (levels) ->

            cb = new CloudburstOL3(
              CBCONFIG.host + instance.resources.tile, times, levels, layer.bounds
            )
            cb.setOL3LayerTile() # Sets and returns cb.tileLayer

            basemap = new ol.layer.Tile(
                source: new ol.source.XYZ
                  attributons: [
                    new ol.Attribution
                      html: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                  ]
                  url: 'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
              )

            osm = new ol.layer.Tile (
                source: new ol.source.XYZ
                  attributions: [
                    new ol.Attribution
                      html: '&copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>'
                    ,
                    ol.source.OSM.ATTRIBUTION
                  ]
                  crossOrigin: null
                  url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
              )

            map = new ol.Map
              target: 'map'
              renderer: 'canvas'
              layers: [basemap, cb.tileLayer]#, osm]
              view: new ol.View
                center: new ol.proj.fromLonLat([-98.35, 39.5])
                zoom: 4

            $(document).ready ->
              if cb.hasTimes?
                setInterval () ->
                  # Change the time step every n seconds, reset the OL3Layer
                  cb.forward()
                  change_header(cb.getTime())
                  cb.setOL3LayerTile({'opacity': 0.1, 'visible': no})
                  map.getLayers().set(1, cb.tileLayer)
                  source = map.getLayers().item(1).getSource()
                  # Refresh the tiles
                  source.setTileLoadFunction(source.getTileLoadFunction());
                , 20*1000

main = ->
  init()
