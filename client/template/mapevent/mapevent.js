
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
        longitude : event.geo.longitude,
        icon: L.mapbox.marker.icon({
        'marker-size': 'small',
        'marker-color': selectColor(event)
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
      if (marker){
        if (map.hasLayer(marker)) map.removeLayer(marker);
        var containerNode = document.createElement('div');
        Blaze.renderWithData(Template.mapeventpopup, event, containerNode);
        var marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
          _id: event._id._str,
          title: event.name,
          latitude : event.geo.latitude,
          longitude : event.geo.longitude,
          icon: L.mapbox.marker.icon({
          'marker-size': 'small',
          'marker-color': selectColor(event)
      })
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

const initialize = ( element, zoom, features ) => {
  let self = this;
  let geo = Location.getReactivePosition();
  if(geo && geo.latitude){
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
    map = L.mapbox.map(element,'mapbox.streets').setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom);
    var marker = L.marker(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)),{icon: L.mapbox.marker.icon({
    'marker-size': 'small',
    'marker-color': '#fa0'
})}).bindPopup('Vous êtes ici :)');
    map.addLayer(marker);
  }
}

const addMarker = (marker) => {
  map.addLayer(marker);
  markers[marker.options._id] = marker;
  if (Session.get('currentEvent') === marker.options._id) {
    marker.openPopup();
    map.panTo([marker.options.latitude, marker.options.longitude]);
  }
}

const removeMarker = (_id) => {
  var marker = markers[_id];
  if (map.hasLayer(marker)) map.removeLayer(marker);
}

const selectColor = (event) => {
  let inputDate = new Date();
  if(event.startDate<inputDate && event.endDate<inputDate){
    return '#cccccc';
  }else if(event.startDate<=inputDate && event.endDate>inputDate){
    return '#33cd5f';
  }else{
    return '#324553';
  }
}
