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
import { Organizations,BlockOrganizationsRest } from '../../api/organizations.js';
import { Cities } from '../../api/cities.js';

//submanager
import { listOrganizationsSubs,listsSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js'

import './list.html';

import { pageSession,geoId } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery,queryGeoFilter } from '../../api/helpers.js';

Template.listOrganizations.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  pageSession.set('sortOrganizations', null);
  pageSession.set('searchOrganizations', null);

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listOrganizations
  self.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      console.log('sub list organizations geo radius');
      let handle = listOrganizationsSubs.subscribe('geo.scope','organizations',latlngObj,radius);
          self.ready.set(handle.ready());
    }else{
      console.log('sub list organizations city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = listOrganizationsSubs.subscribe('geo.scope','organizations',city.geoShape);
            self.ready.set(handle.ready());
      }
    }

  });

  self.autorun(function(c) {
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

Template.listOrganizations.onRendered(function() {

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


Template.listOrganizations.helpers({
  organizations () {
    let inputDate = new Date();
    let searchOrganizations= pageSession.get('searchOrganizations');
    let query={};
    query = queryGeoFilter(query);
    if(searchOrganizations){
      query = searchQuery(query,searchOrganizations);
    }
    return Organizations.find(query);
  },
  countOrganizations () {
    let inputDate = new Date();
    let searchOrganizations= pageSession.get('searchOrganizations');
    let query={};
    query = queryGeoFilter(query);
    if(searchOrganizations){
      query = searchQuery(query,searchOrganizations);
    }
    return Organizations.find(query).count();
  },
  searchOrganizations (){
    return pageSession.get('searchOrganizations');
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
return Template.instance().ready.get() && Organizations.find(query).count() === Counts.get(`countScopeGeo.organizations`);
},
dataReadyPourcentage() {
  let query={};
  query = queryGeoFilter(query);
  return  `${Organizations.find(query).count()}/${Counts.get('countScopeGeo.organizations')}`;
}
});

Template.listOrganizations.events({
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchOrganizations', event.currentTarget.value);
    }else{
      pageSession.set( 'searchOrganizations', null);
    }
  },
});

/*
Meteor.call('searchGlobalautocomplete',{name:'test',searchType:['organizations']})
*/
Template.organizationsAdd.onCreated(function () {
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
      const handleList = listsSubs.subscribe('lists','organisationTypes');
      if(handleList.ready()){
        template.ready.set(handleList.ready());
      }
  });
});

Template.organizationsEdit.onCreated(function () {
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
      const handleList = listsSubs.subscribe('lists','organisationTypes');
      const handle = Meteor.subscribe('scopeDetail','organizations',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});

Template.organizationsBlockEdit.onCreated(function () {
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
      const handleList = listsSubs.subscribe('lists','organisationTypes');
      const handle = Meteor.subscribe('scopeDetail','organizations',Router.current().params._id);
      if(handleList.ready() && handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});

Template.organizationsAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.organizationsEdit.helpers({
  organization () {
    let organization = Organizations.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let organizationEdit = {};
    organizationEdit._id = organization._id._str;
    organizationEdit.name = organization.name;
    organizationEdit.type = organization.type;
    organizationEdit.email = organization.email;
    organizationEdit.url = organization.url;
    organizationEdit.role = organization.role;
    organizationEdit.tags = organization.tags;
    organizationEdit.description = organization.description;
    organizationEdit.shortDescription = organization.shortDescription;
    if(organization && organization.preferences){
      organizationEdit.preferences = {};
      if(organization.preferences.isOpenData == "true"){
        organizationEdit.preferences.isOpenData = true;
      }else{
        organizationEdit.preferences.isOpenData = false;
      }
      if(organization.preferences.isOpenEdition == "true"){
        organizationEdit.preferences.isOpenEdition = true;
      }else{
        organizationEdit.preferences.isOpenEdition = false;
      }
    }
    organizationEdit.country = organization.address.addressCountry;
    organizationEdit.postalCode = organization.address.postalCode;
    organizationEdit.city = organization.address.codeInsee;
    organizationEdit.cityName = organization.address.addressLocality;
    if(organization && organization.address && organization.address.streetAddress){
      organizationEdit.streetAddress = organization.address.streetAddress;
    }
    if(organization && organization.address && organization.address.regionName){
      organizationEdit.regionName = organization.address.regionName;
    }
    if(organization && organization.address && organization.address.depName){
      organizationEdit.depName = organization.address.depName;
    }
    organizationEdit.geoPosLatitude = organization.geo.latitude;
    organizationEdit.geoPosLongitude = organization.geo.longitude;
    return organizationEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.organizationsBlockEdit.helpers({
  organization () {
    let organization = Organizations.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let organizationEdit = {};
    organizationEdit._id = organization._id._str;
    if(Router.current().params.block === 'descriptions'){
      organizationEdit.description = organization.description;
      organizationEdit.shortDescription = organization.shortDescription;
    }else if(Router.current().params.block === 'info'){
      organizationEdit.name = organization.name;
      organizationEdit.type = organization.type;
      organizationEdit.role = organization.role;
      if(organization.tags){
        organizationEdit.tags = organization.tags;
      }
      organizationEdit.email = organization.email;
      organizationEdit.url = organization.url;
      if(organization.telephone){
        if(organization.telephone.fixe){
          organizationEdit.fixe = organization.telephone.fixe.join();
        }
        if(organization.telephone.mobile){
          organizationEdit.mobile = organization.telephone.mobile.join();
        }
        if(organization.telephone.fax){
          organizationEdit.fax = organization.telephone.fax.join();
        }
      }
    }else if(Router.current().params.block === 'network'){
      if(organization.socialNetwork){
        if(organization.socialNetwork.instagram){
        organizationEdit.instagram = organization.socialNetwork.instagram;
      }
      if(organization.socialNetwork.skype){
        organizationEdit.skype = organization.socialNetwork.skype;
      }
      if(organization.socialNetwork.googleplus){
        organizationEdit.gpplus = organization.socialNetwork.googleplus;
      }
      if(organization.socialNetwork.github){
        organizationEdit.github = organization.socialNetwork.github;
      }
      if(organization.socialNetwork.twitter){
        organizationEdit.twitter = organization.socialNetwork.twitter;
      }
      if(organization.socialNetwork.facebook){
        organizationEdit.facebook = organization.socialNetwork.facebook;
      }
      }
    }else if(Router.current().params.block === 'locality'){
      if(organization && organization.address){
      organizationEdit.country = organization.address.addressCountry;
      organizationEdit.postalCode = organization.address.postalCode;
      organizationEdit.city = organization.address.codeInsee;
      organizationEdit.cityName = organization.address.addressLocality;
      if(organization && organization.address && organization.address.streetAddress){
        organizationEdit.streetAddress = organization.address.streetAddress;
      }
      if(organization && organization.address && organization.address.regionName){
        organizationEdit.regionName = organization.address.regionName;
      }
      if(organization && organization.address && organization.address.depName){
        organizationEdit.depName = organization.address.depName;
      }
      organizationEdit.geoPosLatitude = organization.geo.latitude;
      organizationEdit.geoPosLongitude = organization.geo.longitude;
    }
  }else if(Router.current().params.block === 'preferences'){
    if(organization && organization.preferences){
      organizationEdit.preferences = {};
      if(organization.preferences.isOpenData === true){
        organizationEdit.preferences.isOpenData = true;
      }else{
        organizationEdit.preferences.isOpenData = false;
      }
      if(organization.preferences.isOpenEdition === true){
        organizationEdit.preferences.isOpenEdition = true;
      }else{
        organizationEdit.preferences.isOpenEdition = false;
      }
    }
  }
    return organizationEdit;
  },
  blockSchema() {
    return BlockOrganizationsRest[Router.current().params.block];
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

Template.organizationsFields.helpers({
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
  }
});


Template.organizationsFields.onRendered(function() {
  var self = this;
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  let geolocate = Session.get('geolocate');
  if(geolocate && Router.current().route.getName()!="organizationsEdit" && Router.current().route.getName()!="organizationsBlockEdit"){
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
});

Template.organizationsFields.onDestroyed(function () {
this.$('textarea').atwho('destroy');
});

Template.organizationsFields.events({
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

AutoForm.addHooks(['addOrganization', 'editOrganization'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'organizations'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'organizations'});
      }
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
      //if (error.reason === 'Something went really bad  An organization with the same name allready exists') {
      //this.addStickyValidationError('name', error.reason.replace(":", " "));
      //this.addStickyValidationError('name', error.errorType , error.reason)
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});

AutoForm.addHooks(['addOrganization'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});

AutoForm.addHooks(['editBlockOrganization'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        if(Session.get('block')!=='preferences'){
        Router.go('detailList', {_id:Session.get('scopeId'),scope:'organizations'});
      }
      }
    }
  },
  before: {
    "method-update" : function(modifier, documentId) {
      let scope = 'organizations';
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
