# coffee -cb src/cloudburst.coffee

class Cloudburst
  constructor: (url) ->
    @url = url

  do_log: () ->
    console.log(@url)
    return

  loadConfiguration: (cb) ->
    resource = @url.replace /{s}/, '' # Could replace with 'a', 'b', 'c', etc. using L.tileLayer.subdomains
    resource += '/layers.jsonp?callback=read_layers_callback'
    $.ajax
      url: resource
      type: 'GET'
      jsonpCallback: 'read_layers_callback'
      dataType: 'jsonp'
      success: (data, status, response) ->
        if cb? and status is 'success'
          cb(data, @url)
