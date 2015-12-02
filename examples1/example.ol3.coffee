key = "20865bd31bcc4e4dbea2181b9a23d825"
# attribution = new ol.Attribution
#   html: 'Tiles &copy; <a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>'
#
# ol.source.Cloudburst = (options) ->
#   options = if options? then options else {}
#   attributions = if options.attributions? then options.attributions else [ol.source.Cloudburst.ATTRIBUTION]
#
#   # @._layer = options.layer # etc.
#   # TODO needs to be function
#   url = if options.url? then options.url else "http://tiles-{a-d}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/{z}/{x}/{y}.png"
#
#   goog.base @,
#     attributions: attributions
#     tileLoadFunction: options.tileLoadFunction
#     url: url
#
# goog.inherits(ol.source.Cloudburst, ol.source.XYZ)
#

# console.log "HELLO WORLD"
#   # options:
#   #   attributions: [attribution]
#   #   maxZoom: 17
#   #   tileSize: [256, 256]
#   #   tileUrlFunction: @getTileUrl
#
#   # initialize: () ->
#   #   ol.source.XYZ.prototype.initialize.call @,
#   # getTileUrl: (coords, proj) ->
#   #   console.log coords, proj
#   #   return "http://tiles-{a-d}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/{z}/{x}/{y}.png"
#   #   # # Replace [cloudburst] in the prototype URL with parameters from the config
#   #   # L.TileLayer.prototype.getTileUrl
#   #   #   .call @, coords
#   #   #   .replace /\[cloudburst\]/,
#   #   #     "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/"
#
# map = new ol.Map
#   target: 'map'
#   layers: [
#     new ol.layer.Tile
#       source: new ol.source.XYZ
#         url: "http://tiles-{a-d}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/{z}/{x}/{y}.png"
#         # tilePixelRatio: 2 # retina
#         minZoom: mapMinZoom
#         maxZoom: mapMaxZoom
#         attributions: [attribution]
#   ],
#   view: new ol.View
#     center: ol.proj.fromLonLat([174.7772, -41.2889])
# #     zoom: 4
#
# # getTileURL = (imagetile, src) ->
# #   console.log "getTileURL"
# #   console.log imagetile, src
# #   return "http://tiles-{a-d}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/{z}/{x}/{y}.png"
# #
# # # NOTE: just give an xyz a new tileURLFunction!
# # CloudburstXYZ = new ol.source.XYZ
# #   attributions: [
# #     new ol.Attribution
# #       html: '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>'
# #     ]
# #   maxZoom: 17
# #   tileLoadFunction: (imageTile, src) ->
# #     console.log imageTile, src
# #
# # map = new ol.Map
# #   target: 'map'
# #   layers: [
# #     new ol.layer.Tile
# #       source: CloudburstXYZ
# #   ]
# #   view: new ol.View
# #     center: ol.proj.fromLonLat([174.7772, -41.2889])
# #     zoom: 4
# #
# # console.log "HELLO WORLD"

# CloudburstXYZ = (options) ->
#   options = if options? then options else {}
#   console.log options
#
#   if !options.maxZoom?
#     options.maxZoom = 17
#
#   if !options.attribution?
#     options.attributions = [
#       new ol.Attribution
#         html: '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>'
#       ]
#
#   if !options.url?
#     options.url = "http://tiles-{a-d}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/{z}/{x}/{y}.png"
#   console.log options.url, options
#   # getURL = function(e)
#
#   return ol.source.XYZ.call @,
#     maxZoom: options.maxZoom
#     attributions: options.attributions
#     url: options.url
#
# ol.inherits(CloudburstXYZ, ol.source.XYZ)
#
# CloudburstXYZ.prototype = Object.create(ol.source.XYZ.prototype)

layers = [
  new ol.layer.Tile(
    source: new ol.source.XYZ
      attributions: [
        new ol.Attribution
          html: 'TODO'
      ]
      maxZoom: 21
      tileUrlFunction: (tileCoord, pixelRatio, projection) ->
        z = tileCoord[0]
        x = tileCoord[1]
        y = tileCoord[2] + (1 << z)
        # subdomains?
        # s = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}[Math.floor((Math.random() * 4) + 1)]
        # url = "http://tiles-#{s}.data-cdn.linz.govt.nz/services;key=#{key}/tiles/v4/set=2/EPSG:3857/#{z}/#{x}/#{y}.png"
        renderer = 'mpl'
        layer = 'ncep_hs'
        instance = '20150922_12z'
        t = 0
        url = "http://localhost:6060/tile/#{renderer}/#{layer}/#{instance}/#{t}/#{z}/#{x}/#{y}.png"
        console.log url
        return url
  )
  # new ol.layer.Tile (
  #   source: new ol.source.XYZ
  #     attributions: [
  #       new ol.Attribution
  #         html: '&copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>'
  #       ,
  #       ol.source.OSM.ATRIBUTION
  #     ]
  #     crossOrigin: null
  #     url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
  #     # http://tiles.openseamap.org/seamark/15/17484/10491.png
  # )
]

console.log layers

map = new ol.Map
  target: 'map'
  layers: layers
  view: new ol.View
    center: new ol.proj.fromLonLat([174.7772, -41.2889])
    zoom: 4
    # center: [-472202, 7530279],
    # zoom: 3
