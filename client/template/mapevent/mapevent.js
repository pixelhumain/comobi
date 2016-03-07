
Meteor.startup(function(){
  Mapbox.load();
});

Template.mapevent.onCreated(function () {

});


Template.mapevent.onRendered(function () {

  $(window).resize(function () {
    var h = $(window).height(), offsetTop = 90;
    $('#map_canvas').css('height', (h - offsetTop));
  }).resize();

  this.autorun(function (c) {
    if (Mapbox.loaded()) {
      initialize($("#map_canvas")[0], 13);
      c.stop();
    }
  });

  var self = this;

 if (self.liveQuery) {
   self.liveQuery.stop();
 }

  self.liveQuery = Events.find({}).observe({
    added: function(event) {
      var containerNode = document.createElement('div');
      Blaze.renderWithData(Template.mapeventpopup, event, containerNode);
      var marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
        _id: event._id._str,
        title: event.name,
        latitude : event.geo.latitude,
        longitude : event.geo.longitude
      }).bindPopup(containerNode).on('click', function(e) {
        console.log(e.target.options._id);
        map.panTo([e.target.options.latitude, e.target.options.longitude]);
        Session.set("selected", e.target.options._id);
      });
      addMarker(marker);
    },
    changed: function(event) {
      var marker = markers[event._id._str];
      if (marker){
        if (map.hasLayer(marker)) map.removeLayer(marker);
        var containerNode = document.createElement('div');
        Blaze.renderWithData(Template.mapeventpopup, event, containerNode);
        var marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
          _id: event._id._str,
          title: event.name,
          latitude : event.geo.latitude,
          longitude : event.geo.longitude
        }).bindPopup(containerNode).on('click', function(e) {
          console.log(e.target.options._id);
          map.panTo([e.target.options.latitude, e.target.options.longitude]);
          Session.set("selected", e.target.options._id);
        });
        addMarker(marker);
      }

    },
    removed: function(event) {
      removeMarker(event._id._str);
    }
  });


});

Template.mapevent.onDestroyed(function () {
  var self = this;
  console.log('destroyed');
  Session.set('currentEvent',false);
  map.remove();
  if (self.liveQuery) {
    self.liveQuery.stop();
  }
});

var map , markers = [ ];

var initialize = function(element, zoom, features) {
  let self = this;
  let geo = Location.getReactivePosition();
  if(geo && geo.latitude){
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
    map = L.mapbox.map(element,'mapbox.streets').setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom);
    var marker = L.marker(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude))).bindPopup('Vous êtes ici :)');
    map.addLayer(marker);
  }
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
