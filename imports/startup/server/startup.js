import { Meteor } from 'meteor/meteor';

import { Events } from '../../api/events.js';

Meteor.startup(function() {

// var retour =   Meteor.users.find({_id:"562f3e11e41d7546793ba4c6"});
// console.log(JSON.stringify(retour.fetch()));

/* Events.find({}).fetch().map(function(c){
console.log(c.geo);
if(c.geo && c.geo.longitude){
console.log(c.geo.longitude);
Events.update({_id:c._id}, {$set: {'geoPosition': {
                       type: "Point",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}
}); */

/* Cities.find({}).fetch().map(function(c){
  //console.log(c.geo);
if(c.geo && c.geo.longitude){
console.log(c.geo.longitude);
Cities.update({_id:c._id}, {$set: {'geoPosition': {
                       type: "Point",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}
Cities.update({_id:c._id}, {$set: {'geoShape': {
                       type: "Polygon",
                       'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
                   }}});
}); */

/* Cities._ensureIndex({
  "geoShape": "2dsphere"
});
let retour =Cities.findOne({"geoShape":
{$geoIntersects:
  {$geometry:{ "type" : "Point",
  "coordinates" : [ 55.5579927, -21.220991100000003 ] }
}}});
console.log(retour); */

});
