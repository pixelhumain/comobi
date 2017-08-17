import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mapbox } from 'meteor/communecter:mapbox';
import { AutoForm } from 'meteor/aldeed:autoform';

import { pageSession } from '../../api/client/reactive.js';

import './map.html';

Template.map.onCreated(function () {

});

Template.map.onRendered(function () {

  if (Mapbox.loaded()) {
    const self = this;
    L.mapbox.accessToken = Meteor.settings.public.mapbox;
    const map = L.mapbox.map('map', 'mapbox.streets');
    let marker;
    self.autorun(function() {
      const latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
      const longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
      // console.log(`${city} ${latitude} ${longitude}`);
      if (latitude && longitude) {
      // console.log('recompute');
        map.setView(new L.LatLng(parseFloat(latitude), parseFloat(longitude)), 13);
        if (marker) {
          map.removeLayer(marker);
        }
        marker = L.marker(new L.LatLng(parseFloat(latitude), parseFloat(longitude)), { id: 'point',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          draggable: true,
          icon: L.mapbox.marker.icon({
            'marker-size': 'small',
            'marker-color': '#fa0',
          }) }).addTo(map);

        marker.on('dragend', function(e) {
          console.log('dragend');
          pageSession.set('geoPosLatitude', e.target._latlng.lat);
          pageSession.set('geoPosLongitude', e.target._latlng.lng);
        });
      }
    });
  }
});
