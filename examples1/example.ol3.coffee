
init = (json, host) ->

  # New Cloudburst OL3 Layer
  cb = new CloudburstOL3(json, host)
  cb.setLayer('ncep_mslp') # Otherwise default layer will be used
  cb.setOL3LayerTile() # Sets and returns cb.tileLayer

  # Use cb.tileLayer as a a ol.Map.layers layer
  # (as well as some others for context)

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
    layers: [basemap, cb.tileLayer, osm]
    view: new ol.View
      center: new ol.proj.fromLonLat([174.7772, -41.2889])
      zoom: 5

  change_header = (new_t) ->
    t = document.getElementById('time')
    if t?
      t.innerHTML = ": #{new_t}"
    return

  $(document).ready ->
    setInterval () ->
      # Change the time step every 10 seconds, reset the OL3Layer
      cb.forward()
      change_header(cb.getTindex(yes))
      cb.setOL3LayerTile({'opacity': 0.1, 'visible': no})
      map.getLayers().set(1, cb.tileLayer)
      source = map.getLayers().item(1).getSource()
      # Refresh the tiles
      source.setTileLoadFunction(source.getTileLoadFunction());
    , 10*1000

main = ->
  # New Cloudburst, given a compatible host
  cloudburst = new Cloudburst()
  # Define a callback function, called when the config is ready
  callback = init
  # Load the configuration file, and launch your own callback
  cloudburst.loadConfiguration(callback)
