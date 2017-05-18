import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { geolib } from 'meteor/outatime:geolib';

import { position } from '../../api/client/position.js';

Meteor.startup(() => {

  if(Meteor._localStorage.getItem('radius')){
    Session.set('radius', parseInt(Meteor._localStorage.getItem('radius')));
  }

  if(Meteor._localStorage.getItem('geolocate')){
    Session.set('geolocate', JSON.parse(Meteor._localStorage.getItem('geolocate')));
  }

  position.config();

  Template.registerHelper('distance',function (coordinates) {
    const geo = position.getLatlngObject();
    if(geo && geo.latitude && coordinates){
      let rmetre=geolib.getDistance(
        {latitude: parseFloat(coordinates.latitude), longitude: parseFloat(coordinates.longitude)},
        {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)});
        if(rmetre>1000){
          let rkm=rmetre/1000;
          return 	rkm+' km';
        }else{
          return 	rmetre+' m';
        }
      }else{
        return false;
      }
    });


});


Tracker.autorun(() => {
  //if (Meteor.userId() && Meteor.user()) {
    const geolocate = Session.get('geolocate');
    if (geolocate) {
      position.start();
    } else {
      position.stop();
    }
  //}
});
