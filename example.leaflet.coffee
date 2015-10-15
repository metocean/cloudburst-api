# function defaultFor(arg, val) {
#   return typeof arg !== 'undefined' ? arg : val;
# }
#
# function getTileURI(host, tile, renderer, layer, instance, index, extension) {
#   // Set defaults if left unspecified
#   host = defaultFor(host, 'http://127.0.0.1:6060');
#   tile = defaultFor(tile, 'tile')
#   renderer = defaultFor(renderer, 'mpl');
#   layer = defaultFor(layer, 'ncep_hs');
#   instance = defaultFor(instance, '20150922_12z');
#   index = defaultFor(index, '10');
#   extension = defaultFor(extension, '.png');
#   var r = [host, tile, renderer, layer, instance, index, '{z}/{x}/{y}' + extension].join('/');
#   return r
# }
#
# var map = L.map('map').setView([0,0], 4);
#
# L.tileLayer(
#   getTileURI(),
#   //tileurl,
#   //'127.0.0.1:6060/tile/mpl/ncep_hs/20150922_12z/10/{z}/{x}/{y}/.png',
#   {
#     tms: true,
#     maxZoom: 17,
#     attribution: '&copy; <a href="http://www.metocean.co.nz/">MetOcean Solutions</a>',
#   }
# ).addTo(map);
#
# console.log(map);

serverurl = 'http://localhost:6060'
domain = 'metoceanview.com'
_cloudburst = new Cloudburst(serverurl)
_cloudburst.do_log

# # Load configuration from the server
# _cloudburst.loadConfiguration serverurl, domain, (config) ->
#
# 	# Create a CloudburstTileLayer
# 	cloudburstTilesLayer = L.cloudburstTilesLayer config,
# 		maxZoom: 16
# 		maxNativeZoom: 17
# 		reuseTiles: yes
# 		#detectRetina: yes
#
# 	# For this example we are displaying a randomly selected field. Generally you would want to select the field that was relevant to your application.
# 	randomindex = Math.floor Math.random() * config.layers.length
# 	cloudburstTilesLayer.setLayer config.layers[randomindex]
#
# 	# We're using an example ocean tile layer from nzapstrike, this could be OpenStreetMap, MapBox or any other base tile provider.
# 	nzapstrike = L.tileLayer 'http://map{s}.nzapstrike.net/aqua3/{z}/{x}/{y}.png',
# 		maxZoom: 8
# 		reuseTiles: yes
# 		#detectRetina: yes
#
# 	# Once we've created two tile layers we put them together and create a leaflet map centred over New Zealand.
# 	map = new L.Map 'map',
# 		layers: [nzapstrike, wxTilesLayer]
# 		center: new L.LatLng -37.7772, 175.2756
# 		zoom: 6
# 		attributionControl: no
#
# 	# We can dynamically update the key by calling back, forward or setting a key directly.
# 	setTimeout ->
# 		wxTilesLayer.forward()
# 	, 10000
