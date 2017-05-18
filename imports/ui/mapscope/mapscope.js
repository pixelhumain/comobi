import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mapbox } from 'meteor/communecter:mapbox';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { _ } from 'meteor/underscore';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

import { nameToCollection } from '../../api/helpers.js';

//submanager
import { listEventsSubs,listOrganizationsSubs,listProjectsSubs,listCitoyensSubs } from '../../api/client/subsmanager.js';

import { position } from '../../api/client/position.js';
import { queryGeoFilter } from '../../api/helpers.js';

import './mapscope.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const subs = {};
subs.events = listEventsSubs;
subs.organizations = listOrganizationsSubs;
subs.projects = listProjectsSubs;
subs.citoyens = listCitoyensSubs;

Template.mapCanvas.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  self.autorun(function(c) {
    Session.set("currentScopeId", Router.current().params._id);
  });

  //sub listEvents
  self.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      let handle = subs[Router.current().params.scope].subscribe('geo.scope',Router.current().params.scope,latlngObj,radius);
      self.ready.set(handle.ready());
    }else{
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = subs[Router.current().params.scope].subscribe('geo.scope',Router.current().params.scope,city.geoShape);
        self.ready.set(handle.ready());
      }
    }

  });

});

Template.mapCanvas.onRendered(function () {
  var self = this;
  $(window).resize(function () {
    var h = $(window).height(), offsetTop = 40;
    $('#map_canvas').css('height', (h - offsetTop));
  }).resize();

  self.autorun(function (c) {
    IonLoading.show();
    if (self.ready.get()) {
      if (Mapbox.loaded()) {
        IonLoading.hide();
        c.stop();
      }
    }
  });

  self.autorun(function (c) {
    //if (self.ready.get()) {
      if (Mapbox.loaded()) {
        initialize($("#map_canvas")[0], 13);
        c.stop();
      }
    //}
  });

  if (self.liveQuery) {
    self.liveQuery.stop();
  }
  self.autorun(function (c) {
  if (self.ready.get()) {
  if (Mapbox.loaded()) {
  clearLayers();
  let inputDate = new Date();
  const collection = nameToCollection(Router.current().params.scope);
  let query={};
  query = queryGeoFilter(query);
  //query['created'] = {$gte : inputDate};
  console.log(query);
  query['geo'] = {$exists:1};
  self.liveQuery = collection.find(query).observe({
    added: function(event) {

      if(event && event.geo && event.geo.latitude){
        var containerNode = document.createElement('div');

        Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
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
    changed: function(event) {
      console.log(event._id._str);
      if(event && event.geo && event.geo.latitude){
      var marker = markers[event._id._str];
      if (marker){
        if (map.hasLayer(marker)) map.removeLayer(marker);
        var containerNode = document.createElement('div');
        Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
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
    }
    },
    removed: function(event) {
      console.log(event._id._str);
      removeMarker(event._id._str);
    }
  });
}
}
})

});

Template.mapCanvas.onDestroyed(function () {
  var self = this;
  console.log('destroyed');
  Session.set('currentScopeId',false);
  map.remove();
  if (self.liveQuery) {
    self.liveQuery.stop();
  }
});


let clusters, map , markers = [ ];

const initialize = ( element, zoom, features ) => {
  let self = this;
  let city = Session.get('city');
  let geo = position.getLatlng();
  let options = {
  maxZoom: 18
  };
  if(geo && geo.latitude){
    L.mapbox.accessToken = Meteor.settings.public.mapbox;
    map = L.mapbox.map(element,'mapbox.streets',options);
    map.setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom);

    /*if(city && city.geoShape && city.geoShape.coordinates){
      console.log(JSON.stringify(city.geoShape));
      var featureLayer = L.mapbox.featureLayer({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: city.geoShape
      }]
    }).addTo(map);
    console.log(featureLayer.getGeoJSON());
  }*/

    //var features = L.mapbox.featureLayer('mapbox.dc-markers').addTo(map);
    /*var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
  }).addTo(map);*/

  var marker = L.marker(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)),{icon: L.mapbox.marker.icon({
    'marker-size': 'small',
    'marker-color': '#fa0'
  })}).bindPopup('Vous êtes ici :)');
  map.addLayer(marker);



  clusters = new L.MarkerClusterGroup();


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

/*const collection = nameToCollection(Router.current().params.scope);
let query={};
query = queryGeoFilter(query);
query['geo'] = {$exists:1};
collection.find({geo:{$exists:1}}).map(function(event){
  if(event && event.geo && event.geo.latitude){
  let containerNode = document.createElement('div');
  Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
  let marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
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
});*/
map.addLayer(clusters);

/*if(Session.get('currentScopeId')){
let event = Events.findOne({'_id._str':Session.get('currentScopeId')});
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
  let inversedPoly = new Array();
  console.log("inversePolygon");
  if(typeof polygon != "undefined" && polygon != null){
    _.each(polygon, function(value){
      console.log(value[1]);
      let lat = value[0];
      let lng = value[1];
      inversedPoly.push(new Array(lat, lng));
    });
  }
  return inversedPoly;
};

const addMarker = (marker) => {
  //map.addLayer(marker);
  clusters.addLayer(marker);
  markers[marker.options._id] = marker;
  if (Session.get('currentScopeId') === marker.options._id) {
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

const clearLayers = () => {
  clusters.clearLayers();
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
