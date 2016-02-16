# coffee -cb src/cloudburst.coffee

class Cloudburst
  constructor: ->
    # @url = 'http://www.metoceanview.com:6060'
    @url = 'http://localhost:6060'

  loadConfiguration: (cb) ->
    json_config = JSON.parse(JSON.stringify(@url))
    json_config = json_config.replace(/{s}/ , '')
    json_config += '/layers.jsonp?callback=read_layers_callback'
    $.ajax
      url: json_config
      type: 'GET'
      jsonpCallback: 'read_layers_callback'
      dataType: 'jsonp'
      success: (data, status, response) =>
        if cb? and status is 'success'
          cb(data, @url)
