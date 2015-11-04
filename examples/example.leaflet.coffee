add_random_layer = (json) ->
  # Callback function: when AJAX call to the configuration file is complete
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer 'http://localhost:6060', json,
    maxZoom: 8
    maxNativeZoom: 9
    reuseTiles: yes
    detectRetina: yes

  # For this example we are displaying a randomly selected field. Generally you would want to select the field that was relevant to your application.
  randomindex = Math.floor(Math.random() * Object.keys(json.layers).length)
  cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex])

  # We're using an example ocean tile layer from nzapstrike, this could be OpenStreetMap, MapBox or any other base tile provider.
  suplementary = L.tileLayer 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  	maxZoom: 9
  	reuseTiles: yes
  	detectRetina: yes

  # Once we've created two tile layers we put them together and create a leaflet map centred over New Zealand.
  map = new L.Map 'map',
  	layers: [suplementary, cloudburstTileLayer]
  	center: new L.LatLng -37.7772, 175.2756
  	zoom: 6
  	attributionControl: no

  addElement = (container_id, element, content) ->
    container = document.getElementById(container_id)
    el = document.createElement(element)
    el.innerHTML = '<a href="#">' + content + '</a>'
    container.appendChild(el)

  addElement('layers', 'li', lyr) for lyr in cloudburstTileLayer.getLayers()
  addElement('instances', 'li', lyr) for lyr in cloudburstTileLayer.getInstances()
  addElement('indexes', 'li', lyr) for lyr in cloudburstTileLayer.getTindexes()

  # We can dynamically update the key by calling back, forward or setting a key directly.
  setInterval ->
    cloudburstTileLayer.forward(yes)
  , 5000

# New Cloudburst, given a compatible domain
cloudburst = new Cloudburst('http://localhost:6060')
# Define a callback function that accepts the init JSON
callback = add_random_layer
cloudburst.loadConfiguration(callback)
