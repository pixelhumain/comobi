
Template.mapevent.onCreated(function () {

});

Meteor.startup(function(){
    Mapbox.load();
});

Template.mapevent.onRendered(function () {
  $(window).resize(function () {
  var h = $(window).height(), offsetTop = 90;
  $('#map_canvas').css('height', (h - offsetTop));
}).resize();

this.autorun(function (c) {
  if (Mapbox.loaded()) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
      let geo = Location.getReactivePosition();
      if(geo && geo.latitude){
      initialize($("#map_canvas")[0], [ parseFloat(geo.latitude), parseFloat(geo.longitude) ], 13);
      c.stop();
    }
}
});

Events.find({}).observe({
  added: function(event) {
    var containerNode = document.createElement('div');
        Blaze.renderWithData(Template.mapeventpopup, event, containerNode);
    var marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
      _id: event._id._str,
      title: event.name,
      latitude : event.geo.latitude,
      longitude : event.geo.longitude,
      icon: L.mapbox.marker.icon({
      'marker-color': '#fa0'
  })
}).bindPopup(containerNode).on('click', function(e) {
      console.log(e.target.options._id);
       map.panTo([e.target.options.latitude, e.target.options.longitude]);
      Session.set("selected", e.target.options._id);
    });
    addMarker(marker);
  },
  changed: function(event) {
    var marker = markers[event._id._str];
  },
  removed: function(event) {
    removeMarker(event._id._str);
  }
});

});

Template.mapevent.onDestroyed(function () {

});

var map, markers = [ ];

var initialize = function(element, centroid, zoom, features) {
  var self = this;
  map = L.mapbox.map(element,'mapbox.streets').setView(new L.LatLng(centroid[0], centroid[1]), zoom);
}

var addMarker = function(marker) {
  map.addLayer(marker);
  markers[marker.options._id] = marker;
  if (Session.get('currentEvent') === marker.options._id) {
  marker.openPopup();
  map.panTo([marker.options.latitude, marker.options.longitude]);
        }
}

var removeMarker = function(_id) {
  var marker = markers[_id];
  if (map.hasLayer(marker)) map.removeLayer(marker);
}
