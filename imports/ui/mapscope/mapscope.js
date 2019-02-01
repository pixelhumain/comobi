import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mapbox } from 'meteor/communecter:mapbox';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { IonLoading } from 'meteor/meteoric:ionic';
import { Session } from 'meteor/session';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Poi } from '../../api/poi.js';
import { Classified } from '../../api/classified.js';
import { Citoyens } from '../../api/citoyens.js';

import { queryGeoFilter, nameToCollection } from '../../api/helpers.js';

// submanager
import { listEventsSubs, listOrganizationsSubs, listProjectsSubs, listPoiSubs, listClassifiedSubs, listCitoyensSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import position from '../../api/client/position.js';
import { pageSession } from '../../api/client/reactive.js';

import './mapscope.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Poi = Poi;
window.Classified = Classified;
window.Citoyens = Citoyens;

const subs = {};
subs.events = listEventsSubs;
subs.organizations = listOrganizationsSubs;
subs.projects = listProjectsSubs;
subs.poi = listPoiSubs;
subs.classified = listClassifiedSubs;
subs.citoyens = listCitoyensSubs;

let clusters = [];
let map = [];
const markers = [];

const initialize = (element, zoom) => {
  const geo = position.getLatlng();
  const options = {
    maxZoom: 18,
  };
  if (geo && geo.latitude) {
    L.mapbox.accessToken = Meteor.settings.public.mapbox;
    const tilejson = {
      tiles: ['https://api.mapbox.com/styles/v1/communecter/cj4ziz9st0re02qo4xtqu7puz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2l6eTIyNTYzMDAxbTJ3bng1YTBsa3d0aCJ9.elyGqovHs-mrji3ttn_Yjw'],
      minzoom: 0,
      maxzoom: 18,
    };
    /* map = L.mapbox.map(element)
      .setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom).addLayer(L.mapbox.tileLayer('mapbox.streets'));
      */
    map = L.mapbox.map(element, tilejson, options)
      .setView(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), zoom);

    // const layermapbox = L.tileLayer('https://api.mapbox.com/styles/v1/communecter/cj4ziz9st0re02qo4xtqu7puz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2l6eTIyNTYzMDAxbTJ3bng1YTBsa3d0aCJ9.elyGqovHs-mrji3ttn_Yjw').addTo(map);

    /* if(city && city.geoShape && city.geoShape.coordinates){
    console.log(JSON.stringify(city.geoShape));
    var featureLayer = L.mapbox.featureLayer({
    type: "FeatureCollection",
    features: [{
    type: "Feature",
    geometry: city.geoShape
  }]
}).addTo(map);
console.log(featureLayer.getGeoJSON());
} */

    // var features = L.mapbox.featureLayer('mapbox.dc-markers').addTo(map);
    /* var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map); */

    const marker = L.marker(new L.LatLng(parseFloat(geo.latitude), parseFloat(geo.longitude)), { icon: L.mapbox.marker.icon({
      'marker-size': 'small',
      'marker-color': '#fa0',
    }) }).bindPopup('Vous êtes ici :)');
    map.addLayer(marker);

    // map.attributionControl.setPosition('bottomleft');


    /* var directions = L.mapbox.directions();
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
.addTo(map); */

    /* const collection = nameToCollection(Router.current().params.scope);
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
}); */


    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      // circle radius
      const filterCircle = L.circle([parseFloat(geo.latitude), parseFloat(geo.longitude)], radius, {
        opacity: 0.2,
        weight: 1,
        fillOpacity: 0.2,
      }).addTo(map);
      if (!Session.get('currentScopeId')) {
        map.fitBounds(filterCircle.getBounds());
      }
    } else {
      const city = position.getCity();
      if (city && city.geoShape && city.geoShape.coordinates) {
        const geojson = [
          {
            type: 'Feature',
            geometry: city.geoShape,
            properties: {
              opacity: 0.2,
              weight: 1,
              fillOpacity: 0.2,
            },
          },
        ];
        const polygon = L.geoJson(geojson, { style: L.mapbox.simplestyle.style }).addTo(map);
        if (!Session.get('currentScopeId')) {
          map.fitBounds(polygon.getBounds());
        }
      }
    }

    /* if(Session.get('currentScopeId')){
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
} */

    clusters = new L.MarkerClusterGroup();

    map.addLayer(clusters);
  }
};

const addMarker = (marker) => {
  // map.addLayer(marker);
  clusters.addLayer(marker);
  markers[marker.options._id] = marker;
  if (pageSession.get('currentScopeId') === marker.options._id) {
    // console.log('marker open');
    map.panTo([marker.options.latitude, marker.options.longitude]);
    marker.addTo(map).openPopup();
    map.on('popupclose', function() {
      // console.log('popupclose');
      // map.removeLayer(marker);
    });
  }
};

const removeMarker = (_id) => {
  const marker = markers[_id];
  if (clusters.hasLayer(marker)) clusters.removeLayer(marker);
};

const clearLayers = () => {
  clusters.clearLayers();
};

const selectIcon = (event) => {
  if (event && event.profilMarkerImageUrl) {
    return L.icon({
      iconUrl: `${Meteor.settings.public.urlimage}${event.profilMarkerImageUrl}`,
      iconSize: [53, 60], // 38, 95],
      iconAnchor: [27, 57], // 22, 94],
      popupAnchor: [0, -55], // -3, -76]
    });
  }

  const icoMarkersMap = { default: '',

    city: 'city-marker-default',

    news: 'NEWS_A',
    idea: 'NEWS_A',
    question: 'NEWS_A',
    announce: 'NEWS_A',
    information: 'NEWS_A',

    citoyen: 'citizen-marker-default',
    citoyens: 'citizen-marker-default',
    people: 'citizen-marker-default',

    NGO: 'ngo-marker-default',
    organizations: 'ngo-marker-default',
    organization: 'ngo-marker-default',

    event: 'event-marker-default',
    events: 'event-marker-default',
    meeting: 'event-marker-default',

    project: 'project-marker-default',
    projects: 'project-marker-default',

    markerPlace: 'map-marker',

    poi: 'poi-marker-default',
    'poi.video': 'poi-video-marker-default',
    'poi.link': 'poi-marker-default',
    'poi.geoJson': 'poi-marker-default',
    'poi.compostPickup': 'poi-marker-default',
    'poi.sharedLibrary': 'poi-marker-default',
    'poi.artPiece': 'poi-marker-default',
    'poi.recoveryCenter': 'poi-marker-default',
    'poi.trash': 'poi-marker-default',
    'poi.history': 'poi-marker-default',
    'poi.something2See': 'poi-marker-default',
    'poi.funPlace': 'poi-marker-default',
    'poi.place': 'poi-marker-default',
    'poi.streetArts': 'poi-marker-default',
    'poi.openScene': 'poi-marker-default',
    'poi.stand': 'poi-marker-default',
    'poi.parking': 'poi-marker-default',

    entry: 'entry-marker-default',
    action: 'action-marker-default',

    url: 'url-marker-default',

    address: 'MARKER',

    classified: 'classified-marker-default',

  };
  // const assetPath = '/assets/feadb1ba';
  const iconUrl = `${Meteor.settings.public.assetPath}/images/sig/markers/icons_carto/${icoMarkersMap[Router.current().params.scope]}.png`;
  return L.icon({
    iconUrl: `${Meteor.settings.public.urlimage}${iconUrl}`,
    iconSize: [53, 60], // 38, 95],
    iconAnchor: [27, 57], // 22, 94],
    popupAnchor: [0, -55], // -3, -76]
  });
};

/* const selectColor = (event) => {
  const inputDate = new Date();
  if (event.startDate < inputDate && event.endDate < inputDate) {
    return '#cccccc';
  } else if (event.startDate <= inputDate && event.endDate > inputDate) {
    return '#33cd5f';
  }
  return '#324553';
}; */

Template.mapCanvas.onCreated(function () {
  const self = this;
  scopeSubscribe(this, subs[Router.current().params.scope], 'geo.scope', Router.current().params.scope);

  self.readyDetail = new ReactiveVar();
  self.autorun(function() {
    if (Router.current().params._id) {
      pageSession.set('currentScopeId', Router.current().params._id);
      const handleDetail = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
      if (handleDetail.ready()) {
        self.readyDetail.set(handleDetail.ready());
      }
    }
  });
});

Template.mapCanvas.onRendered(function () {
  const self = this;
  $(window).resize(function () {
    const h = $(window).height();
    const offsetTop = 40;
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
    // if (self.ready.get()) {
    if (Mapbox.loaded()) {
      initialize($('#map_canvas')[0], 13);
      c.stop();
    }
    // }
  });

  if (self.liveQuery) {
    self.liveQuery.stop();
  }
  if (self.liveQueryCurrent) {
    self.liveQueryCurrent.stop();
  }
  self.autorun(function () {
    if (self.ready.get()) {
      if (Mapbox.loaded()) {
        clearLayers();

        const collection = nameToCollection(Router.current().params.scope);

        if (pageSession.get('currentScopeId')) {
          self.liveQueryCurrent = collection.find({ _id: new Mongo.ObjectID(pageSession.get('currentScopeId')), geo: { $exists: 1 } }).observe({
            added(event) {
              if (event && event.geo && event.geo.latitude) {
                const containerNode = document.createElement('div');

                Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
                const marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
                  _id: event._id._str,
                  title: event.name,
                  latitude: event.geo.latitude,
                  longitude: event.geo.longitude,
                  icon: selectIcon(event),
                }).bindPopup(containerNode).on('click', function(e) {
                // console.log(e.target.options._id);
                  map.panTo([e.target.options.latitude, e.target.options.longitude]);
                // pageSession.set('currentScopeId', e.target.options._id);
                });
                addMarker(marker);
              }
            },
            changed(event) {
            // console.log(event._id._str);
              if (event && event.geo && event.geo.latitude) {
                const marker = markers[event._id._str];
                if (marker) {
                  if (map.hasLayer(marker)) map.removeLayer(marker);
                  const containerNode = document.createElement('div');
                  Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
                  const markerAdd = new L.Marker([event.geo.latitude, event.geo.longitude], {
                    _id: event._id._str,
                    title: event.name,
                    latitude: event.geo.latitude,
                    longitude: event.geo.longitude,
                    icon: selectIcon(event),
                  }).bindPopup(containerNode).on('click', function(e) {
                  // console.log(e.target.options._id);
                    map.panTo([e.target.options.latitude, e.target.options.longitude]);
                  // pageSession.set('currentScopeId', e.target.options._id);
                  });
                  addMarker(markerAdd);
                }
              }
            },
            removed(event) {
            // console.log(event._id._str);
              removeMarker(event._id._str);
            },
          });
        }

        let query = {};
        query = queryGeoFilter(query);
        // query['created'] = {$gte : inputDate};

        /* if (Router.current().params.scope === 'events') {

        } */
        query.geo = { $exists: 1 };

        self.liveQuery = collection.find(query).observe({
          added(event) {
            if (event && event.geo && event.geo.latitude) {
              const containerNode = document.createElement('div');

              Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
              const marker = new L.Marker([event.geo.latitude, event.geo.longitude], {
                _id: event._id._str,
                title: event.name,
                latitude: event.geo.latitude,
                longitude: event.geo.longitude,
                icon: selectIcon(event),
              }).bindPopup(containerNode).on('click', function(e) {
                // console.log(e.target.options._id);
                map.panTo([e.target.options.latitude, e.target.options.longitude]);
                // pageSession.set('currentScopeId', e.target.options._id);
              });
              addMarker(marker);
            }
          },
          changed(event) {
            // console.log(event._id._str);
            if (event && event.geo && event.geo.latitude) {
              const marker = markers[event._id._str];
              if (marker) {
                if (map.hasLayer(marker)) map.removeLayer(marker);
                const containerNode = document.createElement('div');
                Blaze.renderWithData(Template.mapscopepopup, event, containerNode);
                const markerAdd = new L.Marker([event.geo.latitude, event.geo.longitude], {
                  _id: event._id._str,
                  title: event.name,
                  latitude: event.geo.latitude,
                  longitude: event.geo.longitude,
                  icon: selectIcon(event),
                }).bindPopup(containerNode).on('click', function(e) {
                  // console.log(e.target.options._id);
                  map.panTo([e.target.options.latitude, e.target.options.longitude]);
                  // pageSession.set('currentScopeId', e.target.options._id);
                });
                addMarker(markerAdd);
              }
            }
          },
          removed(event) {
            // console.log(event._id._str);
            removeMarker(event._id._str);
          },
        });
      }
    }
  });
});

Template.mapCanvas.onDestroyed(function () {
  const self = this;
  // console.log('destroyed');
  pageSession.set('currentScopeId', false);
  map.remove();
  if (self.liveQuery) {
    self.liveQuery.stop();
  }
  if (self.liveQueryCurrent) {
    self.liveQueryCurrent.stop();
  }
});
