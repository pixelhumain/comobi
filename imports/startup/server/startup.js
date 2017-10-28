import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';

import { Gamesmobile, Playersmobile, Questsmobile } from '../../api/gamemobile.js';

Meteor.startup(function() {
  if (Gamesmobile.find().count() === 0) {
    const doc = {};
    
    doc.name = 'game test';
    doc.description = 'description game test';
    doc.startDate = moment('2017-10-25T18:00:00+04:00').toDate();
    doc.endDate = moment('2017-10-28T13:00:00+04:00').toDate();
    const idGame = Gamesmobile.insert(doc);

    const quests = [{
      idGame: idGame._str,
      pointWin: 5,
      order: 1,
      question: 'question 1',
      questType: 'poi',
      questId: '59f09641dd0452f102d0c91f',
    },
    {
      idGame: idGame._str,
      pointWin: 5,
      order: 2,
      question: 'question 2',
      questType: 'poi',
      questId: '59f156c4dd04522909d0c9ae',
    }];
    quests.forEach(function (quest) {
      Questsmobile.insert(quest);
    });
  }

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
