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
import { Random } from 'meteor/random';
import { HTTP } from 'meteor/http';
import { Mapbox } from 'meteor/communecter:mapbox';


//collections
import { Citoyens } from '../../api/citoyens.js';
import { Projects } from '../../api/projects.js';
import { Organizations } from '../../api/organizations.js';
import { Events,BlockEventsRest } from '../../api/events.js';
import { Cities } from '../../api/cities.js';

//submanager
import { dashboardSubs,listEventsSubs,listOrganizationsSubs,listProjectsSubs,listsSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';

import './list.html';

import { pageSession,geoId } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery,queryGeoFilter } from '../../api/helpers.js';

Template.listEvents.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('sortEvents', null);
  pageSession.set('searchEvents', null);

  //mettre sur layer ?
  //Meteor.subscribe('citoyen');

  //sub listEvents
  this.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      const handle = listEventsSubs.subscribe('geo.scope','events',latlngObj,radius);
          template.ready.set(handle.ready());
    }else{
      console.log('sub list events city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        const handle = listEventsSubs.subscribe('geo.scope','events',city.geoShape);
            template.ready.set(handle.ready());
      }
    }

  });

  this.autorun(function(c) {
    const latlngObj = position.getLatlngObject();
    if (latlngObj) {
      Meteor.call('getcitiesbylatlng',latlngObj,function(error, result){
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
    if(!Session.get('GPSstart') && geolocate && !position.getLatlng()){

      IonPopup.confirm({title:TAPi18n.__('Location'),template:TAPi18n.__('Use the location of your profile'),
      onOk: function(){
        if(Citoyens.findOne() && Citoyens.findOne().geo && Citoyens.findOne().geo.latitude){
          Location.setMockLocation({
            latitude : Citoyens.findOne().geo.latitude,
            longitude : Citoyens.findOne().geo.longitude,
            updatedAt : new Date()
          });
          //clear cache
          /*listEventsSubs.clear();
          listOrganizationsSubs.clear();
          listProjectsSubs.clear();
          listCitoyensSubs.clear();
          dashboardSubs.clear();*/
          const geoIdRandom = Random.id();
          geoId.set('geoId', geoIdRandom);
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
    query = queryGeoFilter(query);
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query);
  },
  countEvents () {
    let inputDate = new Date();
    let sortEvents= pageSession.get('sortEvents');
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query = queryGeoFilter(query);
    if(sortEvents === "Current"){
      query['startDate']={$lte : inputDate};
      query['endDate']={$gte : inputDate};
    }else if(sortEvents === "Upcoming"){
      query['startDate']={$gte : inputDate};
    }else if(sortEvents === "History"){
      query['endDate']={$lte : inputDate};
    }
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsCurrent () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query = queryGeoFilter(query);
    query['startDate']={$lte : inputDate};
    query['endDate']={$gte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsUpcoming () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query = queryGeoFilter(query);
    query['startDate']={$gte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsHistory () {
    let inputDate = new Date();
    let searchEvents= pageSession.get('searchEvents');
    let query={};
    query = queryGeoFilter(query);
    query['endDate']={$lte : inputDate};
    if(searchEvents){
      query = searchQuery(query,searchEvents);
    }
    return Events.find(query).count();
  },
  sortEvents (){
    return pageSession.get('sortEvents');
  },
  searchEvents (){
    return pageSession.get('searchEvents');
  },
  city (){
    return Session.get('city');
  },
  dataReady() {
  return Template.instance().ready.get();
  },
  dataReadyAll() {
    let query={};
    query = queryGeoFilter(query);
  return Template.instance().ready.get() && Events.find(query).count() === Counts.get(`countScopeGeo.events`);
  },
  dataReadyPourcentage() {
    let query={};
    query = queryGeoFilter(query);
  return  `${Events.find(query).count()}/${Counts.get('countScopeGeo.events')}`;
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
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
      pageSession.set('organizerType', Router.current().params.scope);
      pageSession.set('organizerId', Router.current().params._id);
  });

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      if(handleList.ready()){
        template.ready.set(handleList.ready());
      }
  });
});

Template.eventsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('organizerId', null);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      const handle = Meteor.subscribe('scopeDetail','events',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });

});

Template.eventsBlockEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function(c) {
      Session.set('scopeId', Router.current().params._id);
      Session.set('block', Router.current().params.block);
  });

  this.autorun(function(c) {
      const handleList = listsSubs.subscribe('lists','eventTypes');
      const handle = Meteor.subscribe('scopeDetail','events',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });

});



Template.eventsAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.eventsEdit.helpers({
  event () {
    let event = Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let eventEdit = {};
    eventEdit._id = event._id._str;
    eventEdit.name = event.name;
    eventEdit.type = event.type;
    eventEdit.shortDescription = event.shortDescription;
    eventEdit.description = event.description;
    eventEdit.startDate = event.startDate;
    eventEdit.endDate = event.endDate;
    if(event && event.preferences){
      eventEdit.preferences = {};
      if(event.preferences.isOpenData == "true"){
        eventEdit.preferences.isOpenData = true;
      }else{
        eventEdit.preferences.isOpenData = false;
      }
      if(event.preferences.isOpenEdition == "true"){
        eventEdit.preferences.isOpenEdition = true;
      }else{
        eventEdit.preferences.isOpenEdition = false;
      }
    }
    eventEdit.allDay = event.allDay;
    eventEdit.country = event.address.addressCountry;
    eventEdit.postalCode = event.address.postalCode;
    eventEdit.city = event.address.codeInsee;
    eventEdit.cityName = event.address.addressLocality;
    if(event && event.address && event.address.streetAddress){
      eventEdit.streetAddress = event.address.streetAddress;
    }
    if(event && event.address && event.address.regionName){
      eventEdit.regionName = event.address.regionName;
    }
    if(event && event.address && event.address.depName){
      eventEdit.depName = event.address.depName;
    }
    eventEdit.geoPosLatitude = event.geo.latitude;
    eventEdit.geoPosLongitude = event.geo.longitude;
    return eventEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.eventsBlockEdit.helpers({
  event () {
    let event = Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let eventEdit = {};
    eventEdit._id = event._id._str;
    if(Router.current().params.block === 'descriptions'){
      eventEdit.description = event.description;
      eventEdit.shortDescription = event.shortDescription;
    }else if(Router.current().params.block === 'info'){
      eventEdit.name = event.name;
      eventEdit.type = event.type;
      if(event.tags){
        eventEdit.tags = event.tags;
      }
      eventEdit.email = event.email;
      eventEdit.url = event.url;
      if(event.telephone){
        if(event.telephone.fixe){
          eventEdit.fixe = event.telephone.fixe.join();
        }
        if(event.telephone.mobile){
          eventEdit.mobile = event.telephone.mobile.join();
        }
        if(event.telephone.fax){
          eventEdit.fax = event.telephone.fax.join();
        }
      }
    }else if(Router.current().params.block === 'network'){
      if(event.socialNetwork){
        if(event.socialNetwork.instagram){
        eventEdit.instagram = event.socialNetwork.instagram;
      }
      if(event.socialNetwork.skype){
        eventEdit.skype = event.socialNetwork.skype;
      }
      if(event.socialNetwork.googleplus){
        eventEdit.gpplus = event.socialNetwork.googleplus;
      }
      if(event.socialNetwork.github){
        eventEdit.github = event.socialNetwork.github;
      }
      if(event.socialNetwork.twitter){
        eventEdit.twitter = event.socialNetwork.twitter;
      }
      if(event.socialNetwork.facebook){
        eventEdit.facebook = event.socialNetwork.facebook;
      }
      }

    }else if(Router.current().params.block === 'when'){
      eventEdit.allDay = event.allDay;
      eventEdit.startDate = event.startDate;
      eventEdit.endDate = event.endDate;
    }else if(Router.current().params.block === 'locality'){
      if(event && event.address){
      eventEdit.country = event.address.addressCountry;
      eventEdit.postalCode = event.address.postalCode;
      eventEdit.city = event.address.codeInsee;
      eventEdit.cityName = event.address.addressLocality;
      if(event && event.address && event.address.streetAddress){
        eventEdit.streetAddress = event.address.streetAddress;
      }
      if(event && event.address && event.address.regionName){
        eventEdit.regionName = event.address.regionName;
      }
      if(event && event.address && event.address.depName){
        eventEdit.depName = event.address.depName;
      }
      eventEdit.geoPosLatitude = event.geo.latitude;
      eventEdit.geoPosLongitude = event.geo.longitude;
    }
  }else if(Router.current().params.block === 'preferences'){
    if(event && event.preferences){
      eventEdit.preferences = {};
      if(event.preferences.isOpenData === true){
        eventEdit.preferences.isOpenData = true;
      }else{
        eventEdit.preferences.isOpenData = false;
      }
      if(event.preferences.isOpenEdition === true){
        eventEdit.preferences.isOpenEdition = true;
      }else{
        eventEdit.preferences.isOpenEdition = false;
      }
    }
  }
    return eventEdit;
  },
  blockSchema() {
    return BlockEventsRest[Router.current().params.block];
  },
  block() {
    return Router.current().params.block;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});



Template.eventsFields.helpers({
  organizerType (){
    return pageSession.get('organizerType');
  },
  organizerId (){
    return pageSession.get('organizerId');
  },
  optionsOrganizerId (organizerType) {
    let optionsOrganizer = false;
    if(Meteor.userId() && Citoyens && Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}) && organizerType){
      console.log(organizerType)
      if(organizerType === 'organizations'){
          optionsOrganizer = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}).listOrganizationsCreator();
    	}else if(organizerType === 'projects'){
          optionsOrganizer =  Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}).listProjectsCreator();
    	}else if(organizerType === 'citoyens'){
    		optionsOrganizer =  Citoyens.find({_id:new Mongo.ObjectID(Meteor.userId())},{fields:{_id:1,name:1}})
    	}
      if(optionsOrganizer){
        console.log(optionsOrganizer.fetch());
        return optionsOrganizer.map(function (c) {
          return {label: c.name, value: c._id._str};
        });
      }
    }else{return false;}
  },
  parentId (){
    return pageSession.get('parentId');
  },
  optionsParentId (organizerType,organizerId) {
    let parent = false;
    if(Meteor.userId() && organizerType && organizerId){
      if(organizerType === 'organizations'){
        if(Organizations && Organizations.findOne({_id:new Mongo.ObjectID(organizerId)})){
          parent = Organizations.findOne({_id:new Mongo.ObjectID(organizerId)});
        }
      }else if(organizerType === 'projects'){
        if(Projects && Projects.findOne({_id:new Mongo.ObjectID(organizerId)})){
          parent = Projects.findOne({_id:new Mongo.ObjectID(organizerId)});
        }
      }else if(organizerType === 'citoyens'){
        if(Citoyens && Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())},{fields:{name:1,_id:1}})){
          parent = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())},{fields:{name:1,_id:1}});
        }
      }
      if(parent){
        const optionsParentId =  parent.listEventsCreator();
        if(optionsParentId){
          //console.log(optionsParentId.fetch());
          console.log(organizerType);
          //const arrayParent =  optionsParentId.fetch();
          if(optionsParentId.count()>0){
            const arrayParent = optionsParentId.map( (c) => {
              return {label: c.name, value: c._id._str};
            });
            return arrayParent;
          }else{
            return false;
          }

        }
      }
    }else{return false;}
  },
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
  },
  regionName (){
    return pageSession.get('regionName') || AutoForm.getFieldValue('regionName');
  },
  depName (){
    return pageSession.get('depName') || AutoForm.getFieldValue('depName');
  },
  dataReadyOrganizer() {
  return Template.instance().readyOrganizer.get();
  },
  dataReadyParent() {
  return Template.instance().readyParent.get();
  },
});

Template.eventsFields.onCreated(function () {
  const self = this;
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.readyOrganizer = new ReactiveVar();
  template.readyParent = new ReactiveVar();
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
  /*pageSession.set('organizerType', null);
  pageSession.set('organizerId', null);*/

  self.autorun(function(c) {
    if(Router.current().params._id && Router.current().params.scope){
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
      pageSession.set('organizerType', Router.current().params.scope);
      pageSession.set('organizerId', Router.current().params._id);
      c.stop();
    }
  });

});

Template.eventsFields.onRendered(function() {
  const self = this;
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  //#tags
  pageSession.set( 'queryTag', false );
  pageSession.set( 'tags', false );
  self.$('textarea').atwho({
    at: "#"
  }).on("matched.atwho", function(event, flag, query) {
      console.log(event, "matched " + flag + " and the result is " + query);
      if(flag === '#' && query){
    console.log(pageSession.get('queryTag'));
    if(pageSession.get( 'queryTag') !== query){
      pageSession.set( 'queryTag', query);
      Meteor.call('searchTagautocomplete',query, function(error,result) {
      if (!error) {
        console.log(result);
        self.$('textarea').atwho('load', '#', result).atwho('run');
      }
    });
    }
  }
    }).on("inserted.atwho", function(event, $li, browser) {
        console.log(JSON.stringify($li.data('item-data')));
        if($li.data('item-data')['atwho-at'] == '#'){
        const tag = $li.data('item-data').name;
        if(pageSession.get('tags')){
          let arrayTags = pageSession.get('tags');
          arrayTags.push(tag);
          pageSession.set( 'tags', arrayTags);
        }else{
          pageSession.set( 'tags', [tag] );
        }
      }
      });

  let geolocate = Session.get('geolocate');
  if(geolocate && Router.current().route.getName()!="eventsEdit" && Router.current().route.getName()!="eventsBlockEdit"){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Utiliser votre position actuelle ?'),
    onOk: function(){
      const latlngObj = position.getLatlngObject();
      if (latlngObj) {
        Meteor.call('getcitiesbylatlng',latlngObj,function(error, result){
          if(result){
            //console.log(result);
            pageSession.set('postalCode', result.postalCodes[0].postalCode);
            pageSession.set('country', result.country);
            pageSession.set('city', result.insee);
            pageSession.set('cityName', result.postalCodes[0].name);
            pageSession.set('regionName', result.regionName);
            pageSession.set('depName', result.depName);
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

  self.autorun(function() {
    let organizerType = pageSession.get('organizerType');
    //console.log(`autorun ${organizerType}`);
      if(organizerType && Meteor.userId()){
        if( organizerType === 'organizations'){
          const handleOrganizer = self.subscribe('directoryListOrganizations','citoyens',Meteor.userId());
          self.readyOrganizer.set(handleOrganizer.ready());
        }else if(organizerType === 'projects'){
          const handleOrganizer = self.subscribe('directoryListProjects','citoyens',Meteor.userId())
          self.readyOrganizer.set(handleOrganizer.ready());
        }else if(organizerType === 'citoyens'){
          const handleOrganizer = self.subscribe('citoyen');
          self.readyOrganizer.set(handleOrganizer.ready());
        }

      }
  });

  self.autorun(function(c) {
    let organizerType = pageSession.get('organizerType');
    let organizerId = pageSession.get('organizerId');
    console.log(`autorun ${organizerType} ${organizerId}`);
      if(organizerType && organizerId){
          const handleParent = self.subscribe('directoryListEvents',organizerType,organizerId);
          self.readyParent.set(handleParent.ready());
      }
  });

});

Template.eventsFields.onDestroyed(function () {
this.$('textarea').atwho('destroy');
});

Template.eventsFields.events({
  'change select[name="organizerType"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'organizerType', tmpl.$(e.currentTarget).val() );
    pageSession.set( 'organizerId', false);
  },
  'change select[name="organizerId"]': function(e, tmpl) {
    e.preventDefault();
    //console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'organizerId', tmpl.$(e.currentTarget).val() );
  },
  'keyup input[name="postalCode"],change input[name="postalCode"]':_.throttle((e, tmpl) => {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  }, 500)
  ,
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
    pageSession.set( 'regionName', insee.regionName);
    pageSession.set( 'depName', insee.depName);
    pageSession.set('cityName', e.currentTarget.options[e.currentTarget.selectedIndex].text);
    //console.log(insee.geo.latitude);
    //console.log(insee.geo.longitude);
  },
  'change input[name="streetAddress"]':_.throttle((event,template) => {
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
}, 500)
});

AutoForm.addHooks(['addEvent', 'editEvent'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'events'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'events'});
      }
    }
  },
  before: {
    method : function(doc, template) {
      //console.log(doc);
      doc.organizerType = pageSession.get('organizerType');
      doc.organizerId = pageSession.get('organizerId');
      const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
      const matches = [];
      let match;
      if(doc.shortDescription){
        while ((match = regex.exec(doc.shortDescription))) {
          matches.push(match[1]);
        }
      }
      if(doc.description){
        while ((match = regex.exec(doc.description))) {
          matches.push(match[1]);
        }
      }
      if(pageSession.get('tags')){
        const arrayTags = _.reject(pageSession.get('tags'), (value) => {
          return matches[value] === null;
        }, matches);
        if(doc.tags){
          doc.tags = _.uniq(_.union(doc.tags,arrayTags,matches));
        }else{
          doc.tags = _.uniq(_.union(arrayTags,matches));
        }
      }else{
        //si on update est ce que la mention reste
        if(matches.length > 0){
        if(doc.tags){
          doc.tags = _.uniq(_.union(doc.tags,matches));
        }else{
          doc.tags = _.uniq(matches);
        }
      }
      }
      console.log(doc.tags);
      return doc;
    },
    "method-update" : function(modifier, documentId) {
      modifier["$set"].organizerType = pageSession.get('organizerType');
      modifier["$set"].organizerId = pageSession.get('organizerId');
      const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
      const matches = [];
      let match;
      if(modifier["$set"].shortDescription){
        while ((match = regex.exec(modifier["$set"].shortDescription))) {
          matches.push(match[1]);
        }
      }
      if(modifier["$set"].description){
        while ((match = regex.exec(modifier["$set"].description))) {
          matches.push(match[1]);
        }
      }
      if(pageSession.get('tags')){
        const arrayTags = _.reject(pageSession.get('tags'), (value) => {
          return matches[value] === null;
        }, matches);
        if(modifier["$set"].tags){
          modifier["$set"].tags = _.uniq(_.union(modifier["$set"].tags,arrayTags,matches));
        }else{
          modifier["$set"].tags = _.uniq(_.union(arrayTags,matches));
        }
      }else{
        //si on update est ce que la mention reste
        if(matches.length > 0){
        if(modifier["$set"].tags){
          modifier["$set"].tags = _.uniq(_.union(modifier["$set"].tags,matches));
        }else{
          modifier["$set"].tags = _.uniq(matches);
        }
      }
      }
      return modifier;
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(": ", ""));
      }
    }
    //let ref;
    //if (error.errorType && error.errorType === 'Meteor.Error') {
      //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});

AutoForm.addHooks(['editBlockEvent'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        if(Session.get('block')!=='preferences'){
        Router.go('detailList', {_id:Session.get('scopeId'),scope:'events'});
      }
      }
    }
  },
  before: {
    "method-update" : function(modifier, documentId) {
      let scope = 'events';
      let block = Session.get('block');
      if(modifier && modifier["$set"]){
        const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
        const matches = [];
        let match;
        if(modifier["$set"].shortDescription){
          while ((match = regex.exec(modifier["$set"].shortDescription))) {
            matches.push(match[1]);
          }
        }
        if(modifier["$set"].description){
          while ((match = regex.exec(modifier["$set"].description))) {
            matches.push(match[1]);
          }
        }
        if(pageSession.get('tags')){
          const arrayTags = _.reject(pageSession.get('tags'), (value) => {
            return matches[value] === null;
          }, matches);
          if(modifier["$set"].tags){
            modifier["$set"].tags = _.uniq(_.union(modifier["$set"].tags,arrayTags,matches));
          }else{
            modifier["$set"].tags = _.uniq(_.union(arrayTags,matches));
          }
        }else{
          //si on update est ce que la mention reste
          if(matches.length > 0){
          if(modifier["$set"].tags){
            modifier["$set"].tags = _.uniq(_.union(modifier["$set"].tags,matches));
          }else{
            modifier["$set"].tags = _.uniq(matches);
          }
        }
        }
      }else{
        modifier["$set"] = {};
      }
      modifier["$set"].typeElement = scope;
      modifier["$set"].block = block;
      return modifier;
    }
  },
  onError: function(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === "error_call") {
        pageSession.set( 'error', error.reason.replace(": ", ""));
      }
    }
  }
});
