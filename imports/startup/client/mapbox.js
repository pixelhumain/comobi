import { Meteor } from 'meteor/meteor';
import { Mapbox } from 'meteor/pauloborges:mapbox';

Meteor.startup(function(){
  Mapbox.load({
    plugins: ['directions','arc','draw', 'markercluster']
  });
});
