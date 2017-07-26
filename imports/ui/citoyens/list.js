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
import { Citoyens,BlockCitoyensRest } from '../../api/citoyens.js';
import { Cities } from '../../api/cities.js';

//submanager
import { listCitoyensSubs } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js'

import './list.html';

import { pageSession,geoId } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery,queryGeoFilter } from '../../api/helpers.js';


Template.listCitoyens.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  pageSession.set('sortCitoyens', null);
  pageSession.set('searchCitoyens', null);

  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  //sub listCitoyens
  self.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      console.log('sub list citoyens geo radius');
      let handle = listCitoyensSubs.subscribe('geo.scope','citoyens',latlngObj,radius);
          self.ready.set(handle.ready());
    }else{
      console.log('sub list citoyens city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = listCitoyensSubs.subscribe('geo.scope','citoyens',city.geoShape);
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

Template.listCitoyens.onRendered(function() {

  const testgeo = () => {
    let geolocate = Session.get('geolocate');
    if(!Session.get('GPSstart') && geolocate && !Location.getReactivePosition()){

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
      },
      cancelText:TAPi18n.__('no'),
      okText:TAPi18n.__('yes')
    });
  }
}

Meteor.setTimeout(testgeo, '3000');
});


Template.listCitoyens.helpers({
  citoyens () {
    let inputDate = new Date();
    let searchCitoyens= pageSession.get('searchCitoyens');
    let query={};
    query = queryGeoFilter(query);
    if(searchCitoyens){
      query = searchQuery(query,searchCitoyens);
    }
      query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
    return Citoyens.find(query);
  },
  countCitoyens () {
    let inputDate = new Date();
    let searchCitoyens= pageSession.get('searchCitoyens');
    let query={};
    query = queryGeoFilter(query);
    if(searchCitoyens){
      query = searchQuery(query,searchCitoyens);
    }
    query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
    return Citoyens.find(query).count();
  },
  searchCitoyens (){
    return pageSession.get('searchCitoyens');
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
  query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
return Template.instance().ready.get() && Citoyens.find(query).count() === Counts.get(`countScopeGeo.citoyens`);
},
dataReadyPourcentage() {
  let query={};
  query = queryGeoFilter(query);
  query['_id']={$ne: new Mongo.ObjectID(Meteor.userId())};
return  `${Citoyens.find(query).count()}/${Counts.get('countScopeGeo.citoyens')}`;
}
});

Template.listCitoyens.events({
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchCitoyens', event.currentTarget.value);
    }else{
      pageSession.set( 'searchCitoyens', null);
    }
  },
});



Template.citoyensEdit.onCreated(function () {
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
      const handle = Meteor.subscribe('scopeDetail','citoyens',Router.current().params._id);
      if(handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});

Template.citoyensEdit.helpers({
  citoyen() {
    let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let citoyenEdit = {};
    citoyenEdit._id = citoyen._id._str;
    citoyenEdit.name = citoyen.name;
    citoyenEdit.type = citoyen.type;
    citoyenEdit.email = citoyen.email;
    citoyenEdit.url = citoyen.url;
    citoyenEdit.role = citoyen.role;
    if(citoyen.tags){
      citoyenEdit.tags = citoyen.tags;
    }
    citoyenEdit.description = citoyen.description;
    citoyenEdit.shortDescription = citoyen.shortDescription;
    if(citoyen.telephone){
      if(citoyen.telephone.fixe){
        citoyenEdit.fixe = citoyen.telephone.fixe.join();
      }
      if(citoyen.telephone.mobile){
        citoyenEdit.mobile = citoyen.telephone.mobile.join();
      }
      if(citoyen.telephone.fax){
        citoyenEdit.fax = citoyen.telephone.fax.join();
      }
    }
    citoyenEdit.birthDate = citoyen.birthDate;
    if(citoyen.socialNetwork){
      if(citoyen.socialNetwork.telegram){
      citoyenEdit.telegramAccount = citoyen.socialNetwork.telegram;
    }
    if(citoyen.socialNetwork.skype){
      citoyenEdit.skypeAccount = citoyen.socialNetwork.skype;
    }
    if(citoyen.socialNetwork.googleplus){
      citoyenEdit.gpplusAccount = citoyen.socialNetwork.googleplus;
    }
    if(citoyen.socialNetwork.github){
      citoyenEdit.githubAccount = citoyen.socialNetwork.github;
    }
    if(citoyen.socialNetwork.twitter){
      citoyenEdit.twitterAccount = citoyen.socialNetwork.twitter;
    }
    if(citoyen.socialNetwork.facebook){
      citoyenEdit.facebookAccount = citoyen.socialNetwork.facebook;
    }
    }

    if(citoyen && citoyen.preferences){
      citoyenEdit.preferences = {};
      if(citoyen.preferences.isOpenData === true){
        citoyenEdit.preferences.isOpenData = true;
      }else{
        citoyenEdit.preferences.isOpenData = false;
      }
    }
    citoyenEdit.country = citoyen.address.addressCountry;
    citoyenEdit.postalCode = citoyen.address.postalCode;
    citoyenEdit.city = citoyen.address.codeInsee;
    citoyenEdit.cityName = citoyen.address.addressLocality;
    if(citoyen && citoyen.address && citoyen.address.streetAddress){
      citoyenEdit.streetAddress = citoyen.address.streetAddress;
    }
    if(citoyen && citoyen.address && citoyen.address.regionName){
      citoyenEdit.regionName = citoyen.address.regionName;
    }
    if(citoyen && citoyen.address && citoyen.address.depName){
      citoyenEdit.depName = citoyen.address.depName;
    }
    citoyenEdit.geoPosLatitude = citoyen.geo.latitude;
    citoyenEdit.geoPosLongitude = citoyen.geo.longitude;
    return citoyenEdit;
  },
  error() {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});


Template.citoyensBlockEdit.onCreated(function () {
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
      const handle = Meteor.subscribe('scopeDetail','citoyens',Router.current().params._id);
      if(handle.ready()){
        template.ready.set(handle.ready());
      }
  });

});

Template.citoyensBlockEdit.helpers({
  citoyen() {
    let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let citoyenEdit = {};
    citoyenEdit._id = citoyen._id._str;
    if(Router.current().params.block === 'descriptions'){
      if(citoyen.description){
        citoyenEdit.description = citoyen.description;
      }
      if(citoyen.shortDescription){
        citoyenEdit.shortDescription = citoyen.shortDescription;
      }
    }else if(Router.current().params.block === 'info'){
      citoyenEdit.name = citoyen.name;
      citoyenEdit.username = citoyen.username;
      if(citoyen.tags){
        citoyenEdit.tags = citoyen.tags;
      }
      citoyenEdit.email = citoyen.email;
      citoyenEdit.url = citoyen.url;
      if(citoyen.telephone){
        if(citoyen.telephone.fixe){
          citoyenEdit.fixe = citoyen.telephone.fixe.join();
        }
        if(citoyen.telephone.mobile){
          citoyenEdit.mobile = citoyen.telephone.mobile.join();
        }
        if(citoyen.telephone.fax){
          citoyenEdit.fax = citoyen.telephone.fax.join();
        }
      }
      citoyenEdit.birthDate = citoyen.birthDate;
    }else if(Router.current().params.block === 'network'){
      if(citoyen.socialNetwork){
        if(citoyen.socialNetwork.telegram){
        citoyenEdit.telegram = citoyen.socialNetwork.telegram;
      }
      if(citoyen.socialNetwork.skype){
        citoyenEdit.skype = citoyen.socialNetwork.skype;
      }
      if(citoyen.socialNetwork.googleplus){
        citoyenEdit.gpplus = citoyen.socialNetwork.googleplus;
      }
      if(citoyen.socialNetwork.github){
        citoyenEdit.github = citoyen.socialNetwork.github;
      }
      if(citoyen.socialNetwork.twitter){
        citoyenEdit.twitter = citoyen.socialNetwork.twitter;
      }
      if(citoyen.socialNetwork.facebook){
        citoyenEdit.facebook = citoyen.socialNetwork.facebook;
      }
      }
    }else if(Router.current().params.block === 'locality'){
      citoyenEdit.country = citoyen.address.addressCountry;
      citoyenEdit.postalCode = citoyen.address.postalCode;
      citoyenEdit.city = citoyen.address.codeInsee;
      citoyenEdit.cityName = citoyen.address.addressLocality;
      if(citoyen && citoyen.address && citoyen.address.streetAddress){
        citoyenEdit.streetAddress = citoyen.address.streetAddress;
      }
      if(citoyen && citoyen.address && citoyen.address.regionName){
        citoyenEdit.regionName = citoyen.address.regionName;
      }
      if(citoyen && citoyen.address && citoyen.address.depName){
        citoyenEdit.depName = citoyen.address.depName;
      }
      citoyenEdit.geoPosLatitude = citoyen.geo.latitude;
      citoyenEdit.geoPosLongitude = citoyen.geo.longitude;
    }else if(Router.current().params.block === 'preferences'){
      if(citoyen && citoyen.preferences){
        citoyenEdit.preferences = {};
        const fieldsArray = ['email','locality','phone','directory','birthDate'];
        if(citoyen && citoyen.preferences && citoyen.preferences.publicFields){
          _.each(fieldsArray, (field) => {
            if(citoyen.isPublicFields(field)){
              citoyenEdit.preferences[field] = 'public';
            }
          });
        }
        if(citoyen && citoyen.preferences && citoyen.preferences.privateFields){
          _.each(fieldsArray, (field) => {
            if(citoyen.isPrivateFields(field)){
              citoyenEdit.preferences[field] = 'private';
            }
          });
        }
        _.each(fieldsArray, (field) => {
          if(!citoyen.isPrivateFields(field) && !citoyen.isPublicFields(field)){
            citoyenEdit.preferences[field] = 'hide';
          }
        });
        if(citoyen.preferences.isOpenData === true){
          citoyenEdit.preferences.isOpenData = true;
        }else{
          citoyenEdit.preferences.isOpenData = false;
        }
      }
    }
    return citoyenEdit;
  },
  blockSchema() {
    return BlockCitoyensRest[Router.current().params.block];
  },
  block() {
    return Router.current().params.block;
  },
  error() {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});


Template.citoyensFields.helpers({
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


Template.citoyensFields.onRendered(function() {
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
  if(geolocate && Router.current().route.getName()!="citoyensEdit" && Router.current().route.getName()!="citoyensBlockEdit"){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Use your current location'),
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
            pageSession.set('regionName', result.regionName);
            pageSession.set('depName', result.depName);
            pageSession.set('geoPosLatitude', result.geo.latitude);
            pageSession.set('geoPosLongitude', result.geo.longitude);
          }
        });
      }
    },
    cancelText:TAPi18n.__('no'),
    okText:TAPi18n.__('yes')
  });
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

Template.citoyensFields.onDestroyed(function () {
this.$('textarea').atwho('destroy');
});

Template.citoyensFields.events({
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

AutoForm.addHooks(['editCitoyen'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'citoyens'});
      }
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

AutoForm.addHooks(['editBlockCitoyen'], {
  after: {
    "method-update" : function(error, result) {
      if (!error) {
        if(Session.get('block')!=='preferences'){
            Router.go('detailList', {_id:Session.get('scopeId'),scope:'citoyens'});
        }
      }
    }
  },
  before: {
    "method-update" : function(modifier, documentId) {
      let scope = 'citoyens';
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
