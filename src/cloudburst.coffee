# coffee -cb src/cloudburst.coffee

# HOST = 'http://www.metoceanview.com:6060'
HOST = 'http://localhost:9090'
# HOST = 'http://tapa01.unisys.metocean.co.nz'

ajax = (uri, method, data) ->
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
    @layersURI ="http://localhost:9090/wxtiles/layer"

  loadConfiguration: (cb) ->
    # TODO tags filter?
    ajax(@layersURI, 'GET').done((layers) ->
      if cb?
        cb(layers)
    )

  loadLayer: (layerID, cb) ->
    ajax([@layersURI, layerID].join('/'), 'GET').done((layer) ->
      if cb?
        cb(layer)
    )

  loadInstance: (layerID, instanceID, cb) ->
    ajax([@layersURI, layerID, instanceID].join('/'), 'GET').done((instance) ->
      if cb?
        cb(instance)
    )

  loadTimes: (layerID, instanceID, cb) ->
    ajax([@layersURI, layerID, instanceID, 'times/'].join('/'), 'GET').done((times) ->
      if cb?
        cb(times)
    )
