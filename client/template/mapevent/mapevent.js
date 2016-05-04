
Meteor.startup(function(){
  Mapbox.load({
    plugins: ['directions','arc','draw', 'markercluster']
  });
});

Template.mapevent.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listEvents
  self.autorun(function(c) {
    let geo = Location.getReactivePosition();
    let radius = Session.get('radius');
    if(radius && geo && geo.latitude){
      console.log('sub list events geo radius');
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      var handle = listEventsSubs.subscribe('citoyenEvents',latlng,radius);
      self.ready.set(handle.ready());
    }else{
      console.log('sub list events city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        var handle = listEventsSubs.subscribe('citoyenEvents',city.geoShape.coordinates);
        self.ready.set(handle.ready());
      }
    }

  });

});

Template.mapevent.onRendered(function () {
  var self = this;
  $(window).resize(function () {
    var h = $(window).height(), offsetTop = 90;
    $('#map_canvas').css('height', (h - offsetTop));
  }).resize();

  self.autorun(function (c) {
    if (self.subscriptionsReady()) {
      if (Mapbox.loaded()) {
        initialize($("#map_canvas")[0], 13);
        c.stop();
      }
    }
  });

  if (self.liveQuery) {
    self.liveQuery.stop();
  }
  let inputDate = new Date();
  self.liveQuery = Events.find({created:{$gte : inputDate}}).observe({
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


var clusters, map , markers = [ ];

const initialize = ( element, zoom, features ) => {
  let self = this;
  let city = Session.get('city');
  let geo = Location.getReactivePosition();
  if(geo && geo.latitude){
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
    map = L.mapbox.map(element,'mapbox.streets').setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom);
    /*var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
  }).addTo(map);*/
  var marker = L.marker(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)),{icon: L.mapbox.marker.icon({
    'marker-size': 'small',
    'marker-color': '#fa0'
  })}).bindPopup('Vous êtes ici :)');
  map.addLayer(marker);
  clusters = new L.MarkerClusterGroup();

  /*if(city && city.geoShape && city.geoShape.coordinates){
  var mapPolygon = L.polygon(city.geoShape.coordinates[0]);
  map.addLayer(mapPolygon);
}*/
//map.attributionControl.setPosition('bottomleft');


/*var directions = L.mapbox.directions();
directions.origin = {
type: 'Feature',
geometry: {
coordinates: [parseFloat(geo.latitude), parseFloat(geo.longitude)]
},
properties: {
query: [parseFloat(geo.latitude), parseFloat(geo.longitude)]
}
};
var directionsLayer = L.mapbox.directions.layer(directions)
.addTo(map);

var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions)
.addTo(map);

var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions)
.addTo(map);

var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
.addTo(map);

var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions)
.addTo(map);*/


Events.find({}).map(function(event){
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
});
map.addLayer(clusters);

/*if(Session.get('currentEvent')){
let event = Events.findOne({'_id._str':Session.get('currentEvent')});
if(event && event.geo && event.geo.latitude){
directions.destination = {
type: 'Feature',
geometry: {
coordinates: [event.geo.latitude, event.geo.longitude]
},
properties: {
query: [event.geo.latitude, event.geo.longitude]
}
};
directions.query();
}
}*/


}
}



const inversePolygon = function(polygon){
  var inversedPoly = new Array();
  console.log("inversePolygon");
  if(typeof polygon != "undefined" && polygon != null){
    _.each(polygon, function(value){
      console.log(value[1]);
      var lat = value[0];
      var lng = value[1];
      inversedPoly.push(new Array(lat, lng));
    });
  }
  return inversedPoly;
};

const addMarker = (marker) => {
  //map.addLayer(marker);
  clusters.addLayer(marker);
  markers[marker.options._id] = marker;
  if (Session.get('currentEvent') === marker.options._id) {
    console.log('marker open')
    marker.addTo(map).openPopup();
    map.panTo([marker.options.latitude, marker.options.longitude]);
    map.on('popupclose', function() {
      console.log('popupclose');
      map.removeLayer(marker);
    });
  }
}

const removeMarker = (_id) => {
  var marker = markers[_id];
  if (clusters.hasLayer(marker)) clusters.removeLayer(marker);
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
