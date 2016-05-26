# coffee -cb src/cloudburst.coffee

# HOST = 'http://www.metoceanview.com:6060'
# HOST = 'http://localhost:6060'
HOST = 'http://tapa01.unisys.metocean.co.nz'

class Cloudburst
  constructor: ->
    @url = HOST + "/layer"

  loadConfiguration: (cb) ->
    # TODO tags filter?
    $.ajax
      url: @url
      type: 'GET'
      jsonpCallback: 'read_layers_callback'
      # jsonp: false
      dataType: 'jsonp'
      success: (data, status, response) =>
        if cb? and status is 'success'
          cb(data, HOST)
