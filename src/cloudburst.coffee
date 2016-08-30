# coffee -cb src/cloudburst.coffee

# "host": "http://www.metoceanview.com:6060"
# "host": "http://tapa01.unisys.metocean.co.nz"
# "host": 'http://localhost'
# "host": "http://tilecache03.wxtiles.com"
# "host": "https://api.wxtiles.com"
# CBCONFIG = {
#   "host": 'https://api.wxtiles.com/v0',
#   "layers": 'https://api.wxtiles.com/v0/wxtiles/layer'
# };
CBCONFIG = {
  "host": 'http://172.16.1.13/v0'
  "layers": 'http://172.16.1.13/v0/wxtiles/layer'
};

ajax = (uri, method, data) ->
  if !uri.endsWith('/')
    uri = uri + '/'
  console.log method + ' request to ' + uri
  request = {
    url: uri,
    type: method,
    contentType: "application/json",
    accepts: "application/json",
    cache: false,
    dataType: 'json',
    data: JSON.stringify(data),
    error: (jqXHR) ->
      console.log("ajax error " + jqXHR.status)
  }
  return $.ajax request


class Cloudburst
  constructor: ->
    @layersURI = "#{CBCONFIG.host}/wxtiles/layer"

  loadConfiguration: (cb) ->
    # TODO tags filter?
    ajax(@layersURI, 'GET').done((layers) ->
      if cb?
        cb(layers)
      cb
    )

  loadLayer: (layerID, cb) ->
    ajax([@layersURI, layerID].join('/'), 'GET').done((layer) ->
      if cb?
        cb(layer)
      cb
    )

  loadInstance: (layerID, instanceID, cb) ->
    ajax([@layersURI, layerID, 'instance', instanceID].join('/'), 'GET').done((instance) ->
      if cb?
        cb(instance)
      cb
    )

  loadTimes: (layerID, instanceID, cb) ->
    ajax([@layersURI, layerID, 'instance', instanceID, 'times'].join('/'), 'GET').done((times) ->
      if cb?
        cb(times)
      cb
    )

  loadLevels: (layerID, instanceID, cb) ->
    ajax([@layersURI, layerID, 'instance', instanceID, 'levels'].join('/'), 'GET').done((levels) ->
      if cb?
        cb(levels)
      cb
    )
