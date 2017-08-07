import { Meteor } from 'meteor/meteor';
import { Mapbox } from 'meteor/communecter:mapbox';

Meteor.startup(function() {
  Mapbox.load({
    plugins: ['directions', 'arc', 'markercluster'],
  });
});
