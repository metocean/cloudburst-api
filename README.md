JavaScript API for **Cloudburst**, the MetOcean Solutions tile server.

## Sample Leaflet interface

### Simple

`examples1/example.leaflet`

Demonstration of a simple interface, using only some of the capabilities of the API.

![alt text][sample-interface-1]

### Advanced

`examples2/example.leaflet`

Demonstration of a more advanced interface, using more of the API's capabilities, and also of Leaflet's (stacking `L.tileLayer`s).

![alt text][sample-interface-2]

In this case, we have two layers showing pressure, with different instances. The semi-transparent background layer demonstrates an older forecast than the top layer.

Note that these layers do no have the same indexes (time steps). This sample application shows the nearest possible values to the user's selection. Watch what happens for the first six hours, where the newer forecast does not yet exist:

![alt text][sample-interface-2-t1]

---

![alt text][sample-interface-2-t2]

---

![alt text][sample-interface-2-t3]


At the other end of the time range, the same occurs, with the newer forecast extending further into the future than the older one.

Of course, you must define your own behaviour for handling partially- or non-overlapping time indexes; just be aware how indexes and instances are defined and write your application appropriately.

<!-- Add image -->

## Sample OpenLayers3 interface

<!-- TODO -->

## Sample Google Maps interface

<!-- TODO -->


[sample-interface-1]: ./examples1/img/example.leaflet.interface.png "Sample Leaflet interface"

[sample-interface-2]: ./examples2/img/example.leaflet.interface.png "Sample advanced Leaflet interface"

[sample-interface-2-t1]: ./examples2/img/example.leaflet.interface.t1.png "Sample advanced Leaflet interface with time step at t1"

[sample-interface-2-t2]: ./examples2/img/example.leaflet.interface.t2.png "Sample advanced Leaflet interface with time step at t2"

[sample-interface-2-t3]: ./examples2/img/example.leaflet.interface.t3.png "Sample advanced Leaflet interface with time step at t3"
