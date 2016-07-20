import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { Helpers } from 'meteor/raix:handlebar-helpers';

import { Location } from 'meteor/djabatav:geolocation-plus';
import { geolib } from 'meteor/outatime:geolib';
import { TAPi18n } from 'meteor/tap:i18n';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';

//collections
import { NotificationHistory } from '../../api/notification_history.js';
import { Documents } from '../../api/documents.js';

//schemas
import { SchemasEventsRest } from '../../api/events.js';
import { SchemasFollowRest } from '../../api/citoyens.js';
import { SchemasNewsRest } from '../../api/news.js';

Meteor.startup(function () {

  if (Meteor.isCordova) {
    window.alert = navigator.notification.alert;
    window.confirm = navigator.notification.confirm;
  }

Session.setDefault('geolocate', true);
Session.setDefault('radius', 25000);
Session.setDefault('GPSstart', false);

let language = window.navigator.userLanguage || window.navigator.language;
if (language.indexOf('-') !== -1)
language = language.split('-')[0];

if (language.indexOf('_') !== -1)
language = language.split('_')[0];

////console.log(language);
//alert('language: ' + language + '\n');

Helpers.setLanguage(language);

TAPi18n.setLanguage(language)
.done(function () {
  //Session.set("showLoadingIndicator", false);
})
.fail(function (error_message) {
  //console.log(error_message);
});



SchemasEventsRest.i18n("schemas.eventsrest");
SchemasFollowRest.i18n("schemas.followrest");

Template.registerHelper('distance',function (coordinates) {
  let geo = Location.getReactivePosition();
  if(geo && geo.latitude){
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

Template.registerHelper('equals',
  function(v1, v2) {
    return (v1 === v2);
  }
);

Template.registerHelper('langChoix',
function() {
  return Helpers.language();
}
);

Template.registerHelper('diffInText',
function(start, end) {
  let a = moment(start);
  let b = moment(end);
  let diffInMs = b.diff(a); // 86400000 milliseconds
  let diffInDays = b.diff(a, 'days'); // 1 day
  let diffInDayText=moment.duration(diffInMs).humanize();
  return diffInDayText;
}
);

Template.registerHelper('isCordova',
function() {
  return Meteor.isCordova;
}
);

Template.registerHelper('imageDoc',
function(id) {
  if(id){
    //console.log(id);
    return Documents.findOne({	id : id,doctype :'image'});
  }else{
    return this && this._id && this._id._str && Documents.findOne({	id : this._id._str,doctype :'image'});
  }
}
);


Template.registerHelper("currentFieldValue", function (fieldName) {
  return AutoForm.getFieldValue(fieldName) || false;
});


Template.registerHelper("SchemasFollowRest", SchemasFollowRest);
Template.registerHelper("SchemasNewsRest", SchemasNewsRest);
Template.registerHelper("SchemasEventsRest", SchemasEventsRest);

let success = function (state) {
  if(state === 'Enabled') {
    //console.log("GPS Is Enabled");
    Session.set('GPSstart', true);
    Location.locate(function(pos){
      Session.set('geo',pos);
      //console.log(pos);
    }, function(err){
      //console.log(err.message);
      Session.set('GPSstart', false);
      Session.set('geo',null);
      Session.set('geoError',err.message);
    });
  }else if(state==="Disabled"){
    //console.log("GPS Is Disabled");
    Session.set('GPSstart', false);
    Session.set('geo',null);
    Session.set('geoError','GPS Is Disabled');
  }else if(state=='NotDetermined' || state=='Restricted'){
    //console.log("Never asked user for auhtorization");
    Session.set('GPSstart', false);
    Session.set('geo',null);
    Session.set('geoError','Never asked user for auhtorization');
  }else if(state==='Denied'){
    //console.log("Asked User for authorization but they denied");
    Session.set('GPSstart', false);
    Session.set('geo',null);
    Session.set('geoError','Asked User for authorization but they denied');
  }
}

let failure = function () {
  //console.log("Failed to get the GPS State");
  Session.set('geoError','Failed to get the GPS State');
  Session.set('GPSstart', false);
}

Location.getGPSState(success, failure, {
  dialog: false
});

});


Tracker.autorun(function() {
  if (Meteor.userId() && Meteor.user()) {
    let geolocate = Session.get('geolocate');
    if(geolocate){
      Location.startWatching(function(pos){
        //console.log("Got a position!", pos);
      }, function(err){
        //console.log("Oops! There was an error", err);
      });
    }else{
      Location.stopWatching();
    }
  }
});

Tracker.autorun(function() {
  if (Reload.isWaitingForResume()) {
    alert("Fermer et ré-ouvrir cette application pour obtenir la nouvelle version!");
    //window.location.reload();
  }
});

Tracker.autorun(function() {
  let geoError = Session.get('geoError');
  if (geoError) {
    //alert(geoError);
  }
});

Location.setGetPositionOptions({
  enableHighAccuracy: false,
});
