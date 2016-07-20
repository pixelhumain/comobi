import './list.html';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { Mapbox } from 'meteor/pauloborges:mapbox';


//collections
import { Citoyens } from '../../api/citoyens.js';
import { Events } from '../../api/events.js';
import { NotificationHistory } from '../../api/notification_history.js';
import { Cities } from '../../api/cities.js';

//submanager
import { listEventsSubs } from '../../api/client/subsmanager.js';

let pageSession = new ReactiveDict('pageEvents');

Template.map.onCreated(function () {

});

Template.map.onRendered(function () {
  var self = this;
  L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
  let map = L.mapbox.map('map','mapbox.streets');
  var marker;
  self.autorun(function(c) {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    //console.log(`${city} ${latitude} ${longitude}`);
    if (latitude && longitude) {
      //console.log('recompute');
      map.setView(new L.LatLng(parseFloat(latitude), parseFloat(longitude)), 13);
      if(marker){
        map.removeLayer(marker);
      }
      marker = L.marker(new L.LatLng(parseFloat(latitude), parseFloat(longitude))).bindPopup('Vous êtes ici :)').addTo(map);
    }
    //c.stop();
  });

});

Template.listEvents.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  pageSession.set('sortEvents', null);
  pageSession.set('searchEvents', null);

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listEvents
  self.autorun(function(c) {
    let geo = Location.getReactivePosition();
    let radius = Session.get('radius');
    if(radius && geo && geo.latitude){
      //console.log('sub list events geo radius');
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      let handle = listEventsSubs.subscribe('citoyenEvents',latlng,radius);
          self.ready.set(handle.ready());
    }else{
      //console.log('sub list events city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = listEventsSubs.subscribe('citoyenEvents',city.geoShape.coordinates);
            self.ready.set(handle.ready());
      }
    }

  });

  self.autorun(function(c) {
    let geo = Location.getReactivePosition();
    if(geo && geo.latitude){
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      Meteor.call('getcitiesbylatlng',latlng,function(error, result){
        if(result){
          //console.log('call city');
          Session.set('city', result);
        }
      });
    }
  });

});

Template.listEvents.onRendered(function() {

  const testgeo = () => {
    let geolocate = Session.get('geolocate');
    if(!Session.get('GPSstart') && geolocate && !Location.getReactivePosition()){

      IonPopup.confirm({title:TAPi18n.__('Position'),template:TAPi18n.__('Utiliser la position de votre profil'),
      onOk: function(){
        if(Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude){
          Location.setMockLocation({
            latitude : Citoyens.findOne().geo.latitude,
            longitude : Citoyens.findOne().geo.longitude,
            updatedAt : new Date()
          });
          //clear cache
          listEventsSubs.clear();
        }
      },
      onCancel: function(){
        Router.go('changePosition');
      }
    });
  }
}

Meteor.setTimeout(testgeo, '3000');
});


Template.listEvents.helpers({
  events () {
    let inputDate = new Date();
    let sortEvents= pageSession.get('sortEvents');
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      if ( searchEvents.charAt( 0 ) == '#' ) {
        query['name']={$regex : searchEvents, '$options' : 'i'}
      }else{
        query['name']={$regex : searchEvents, '$options' : 'i'}
      }

    }
    return Events.find(query);
  },
  countEvents () {
    let inputDate = new Date();
    let sortEvents= pageSession.get('sortEvents');
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      query['name']={$regex : searchEvents, '$options' : 'i'}
    }
    return Events.find(query).count();
  },
  countEventsCurrent () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['startDate']={$lte : inputDate};
    query['endDate']={$gte : inputDate};
    if(searchEvents){
      query['name']={$regex : searchEvents, '$options' : 'i'}
    }
    return Events.find(query).count();
  },
  countEventsUpcoming () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['startDate']={$gte : inputDate};
    if(searchEvents){
      query['name']={$regex : searchEvents, '$options' : 'i'}
    }
    return Events.find(query).count();
  },
  countEventsHistory () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query['endDate']={$lte : inputDate};
    if(searchEvents){
      query['name']={$regex : searchEvents, '$options' : 'i'}
    }
    return Events.find(query).count();
  },
  sortEvents (){
    return pageSession.get('sortEvents');
  },
  searchEvents (){
    return pageSession.get('searchEvents');
  },
  notificationsCountOld (){
    let notificationsCountOld = pageSession.get('notificationsCount');
    pageSession.set('notificationsCount',null);
    let notificationsCount = NotificationHistory.find({}).count();
    if(notificationsCountOld<notificationsCount){
      pageSession.set('notificationsCount',notificationsCount);
      return true;
    }else{
      return false;
    }
  },
  notificationsCount () {
    return NotificationHistory.find({}).count()
  },
  city (){
    return Session.get('city');
  }
});

Template.listEvents.events({
  'click .triEvents':function(event, template){
    event.preventDefault();
    pageSession.set('sortEvents', event.target.value);
    //console.log("sortEvents",  event.target.value);
  },
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchEvents', event.currentTarget.value);
    }else{
      pageSession.set( 'searchEvents', null);
    }
  },
});

Template.eventsAdd.onCreated(function () {
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
  this.subscribe('lists');
});

Template.eventsEdit.onCreated(function () {
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.eventsAdd.helpers({

});

Template.eventsEdit.helpers({
  event () {
    let event = Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let eventEdit = {};
    eventEdit._id = event._id._str;
    eventEdit.name = event.name;
    eventEdit.type = event.type;
    eventEdit.description = event.description;
    eventEdit.startDate = event.startDate;
    eventEdit.endDate = event.endDate;
    eventEdit.allDay = event.allDay;
    eventEdit.country = event.address.addressCountry;
    eventEdit.postalCode = event.address.postalCode;
    eventEdit.city = event.address.codeInsee;
    eventEdit.cityName = event.address.addressLocality;
    if(event && event.address && event.address.streetAddress){
      eventEdit.streetAddress = event.address.streetAddress;
    }
    eventEdit.geoPosLatitude = event.geo.latitude;
    eventEdit.geoPosLongitude = event.geo.longitude;
    return eventEdit;
  }
});



Template.eventsFields.helpers({
  optionsInsee () {
    let postalCode = '';
    let country = '';
    postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    country = pageSession.get('country') || AutoForm.getFieldValue('country');
    if(postalCode && country){
      let insee = Cities.find({'postalCodes.postalCode':postalCode,country:country});
      //console.log(insee.fetch());
      if(insee){
        return insee.map(function (c) {
          return {label: c.alternateName, value: c.insee};
        });
      }
    }else{return false;}
  },
  latlng () {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    return city && latitude && longitude;
  },
  longitude (){
    return pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
  },
  latitude (){
    return pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
  },
  country (){
    return pageSession.get('country') || AutoForm.getFieldValue('country');
  },
  postalCode (){
    return pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
  },
  city (){
    return pageSession.get('city') || AutoForm.getFieldValue('city');
  },
  cityName (){
    return pageSession.get('cityName') || AutoForm.getFieldValue('cityName');
  }
});


Template.eventsFields.onRendered(function() {
  var self = this;
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  let geolocate = Session.get('geolocate');
  if(geolocate){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Utiliser votre position actuelle ?'),
    onOk: function(){
      let geo = Location.getReactivePosition();
      if(geo && geo.latitude){
        let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
        Meteor.call('getcitiesbylatlng',latlng,function(error, result){
          if(result){
            //console.log(result);
            pageSession.set('postalCode', result.postalCodes[0].postalCode);
            pageSession.set('country', result.country);
            pageSession.set('city', result.insee);
            pageSession.set('cityName', result.postalCodes[0].name);
            pageSession.set('geoPosLatitude', result.geo.latitude);
            pageSession.set('geoPosLongitude', result.geo.longitude);
          }
        });
      }
    }});
  }

  self.autorun(function() {
    let postalCode = pageSession.get('postalCode')  || AutoForm.getFieldValue('postalCode');
    let country = pageSession.get('country')  || AutoForm.getFieldValue('country');
    let city = pageSession.get('city');
    if (!!postalCode && !!country) {
      if(postalCode.length>4){
        //console.log(`${postalCode} ${country}`);
        //console.log('recompute');
        //console.log('subscribs');
        self.subscribe('cities',postalCode,country);
      }
    }
  });
});


Template.eventsFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]': function(e, tmpl) {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="country"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'country', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="city"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'city', tmpl.$(e.currentTarget).val() );
    let insee = Cities.findOne({insee:tmpl.$(e.currentTarget).val()});
    pageSession.set( 'geoPosLatitude', insee.geo.latitude);
    pageSession.set( 'geoPosLongitude', insee.geo.longitude);
    pageSession.set('cityName', e.currentTarget.options[e.currentTarget.selectedIndex].text);
    //console.log(insee.geo.latitude);
    //console.log(insee.geo.longitude);
  },
  'change input[name="streetAddress"]': function(event,template){

    function addToRequest(request, dataStr){
      if(dataStr == "") return request;
      if(request != "") dataStr = " " + dataStr;
      return transformNominatimUrl(request + dataStr);
    }

    //remplace les espaces par des +
    function transformNominatimUrl(str){
      var res = "";
      for(var i = 0; i<str.length; i++){
        res += (str.charAt(i) == " ") ? "+" : str.charAt(i);
      }
      return res;
    };


    let postalCode = '';
    let country = '';
    let streetAddress = '';
    postalCode = AutoForm.getFieldValue('postalCode');
    country = template.find('select[name="country"]').options[template.find('select[name="country"]').selectedIndex].text;
    //console.log(country);
    streetAddress = AutoForm.getFieldValue('streetAddress');

    var request = "";

    request = addToRequest(request, streetAddress);
    request = addToRequest(request, postalCode);
    request = addToRequest(request, country);
    request = transformNominatimUrl(request);

    if(event.currentTarget.value.length>5){
      HTTP.get( 'https://maps.googleapis.com/maps/api/geocode/json?address=' + request + '&key='+Meteor.settings.public.googlekey, {},
      function( error, response ) {
        if ( error ) {
          //console.log( error );
        } else {
          //console.log(response.data);
          if (response.data.results.length > 0 && response.data.status != "ZERO_RESULTS") {
            pageSession.set( 'geoPosLatitude', response.data.results[0].geometry.location.lat);
            pageSession.set( 'geoPosLongitude', response.data.results[0].geometry.location.lng);
            //console.log(response.data.results[0].geometry.location.lat);
            //console.log(response.data.results[0].geometry.location.lng);
          }
          return;
        }
      }
    );
  }
}
});

AutoForm.addHooks(['addEvent', 'editEvent'], {
  after: {
    method : function(error, result) {
      if (error) {
        //console.log("Insert Error:", error);
      } else {
        ////console.log("Insert Result:", result);
        IonModal.close();
        //Router.go('listEvents');
      }
    },
    "method-update" : function(error, result) {
      if (error) {
        //console.log("Update Error:", error);
      } else {
        ////console.log("Update Result:", result);
        Router.go('listEvents');
      }
    }
  },
  onError: function(formType, error) {
    let ref;
    if (error.errorType && error.errorType === 'Meteor.Error') {
      //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
      //}
    }
  }
});

AutoForm.addHooks(['addEvent'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});
