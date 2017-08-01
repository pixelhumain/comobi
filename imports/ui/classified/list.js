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
import { Classified } from '../../api/classified.js';
import { Cities } from '../../api/cities.js';

//submanager
import { listClassifiedSubs,scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js'

import './list.html';

import { pageSession,geoId } from '../../api/client/reactive.js';
import { position } from '../../api/client/position.js';
import { searchQuery,queryGeoFilter } from '../../api/helpers.js';


Template.listClassified.onCreated(function () {
  pageSession.set('sortClassified', null);
  pageSession.set('searchClassified', null);
  scopeSubscribe(this,listClassifiedSubs,'geo.scope','classified');
});

Template.listClassified.helpers({
  classified () {
    let inputDate = new Date();
    let searchClassified= pageSession.get('searchClassified');
    let query={};
    query = queryGeoFilter(query);
    if(searchClassified){
      query = searchQuery(query,searchClassified);
    }
    return Classified.find(query);
  },
  countClassified () {
    let inputDate = new Date();
    let searchClassified= pageSession.get('searchClassified');
    let query={};
    query = queryGeoFilter(query);
    if(searchClassified){
      query = searchQuery(query,searchClassified);
    }
    return Classified.find(query).count();
  },
  searchClassified (){
    return pageSession.get('searchClassified');
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
return Template.instance().ready.get() && Classified.find(query).count() === Counts.get(`countScopeGeo.classified`);
},
dataReadyPourcentage() {
  let query={};
  query = queryGeoFilter(query);
return  `${Classified.find(query).count()}/${Counts.get('countScopeGeo.classified')}`;
},
typeI18n(type) {
return  `schemas.classifiedrest.type.options.${type}`;
}

});

Template.listClassified.events({
  'keyup #search, change #search': function(event,template){
    if(event.currentTarget.value.length>2){
      pageSession.set( 'searchClassified', event.currentTarget.value);
    }else{
      pageSession.set( 'searchClassified', null);
    }
  },
});

/*
Meteor.call('searchGlobalautocomplete',{name:'test',searchType:['classified']})
*/
Template.classifiedAdd.onCreated(function () {
  pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
  pageSession.set('section', null);
  pageSession.set('type', null);
  pageSession.set('subtype', null);
});

Template.classifiedEdit.onCreated(function () {
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
  pageSession.set('section', null);
  pageSession.set('type', null);
  pageSession.set('subtype', null);

  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function(c) {
      const handle = Meteor.subscribe('scopeDetail','classified',Router.current().params._id);
      if(handle.ready()){
        template.ready.set(handle.ready());
      }
  });
});


Template.classifiedAdd.helpers({
  error () {
    return pageSession.get( 'error' );
  }
});

Template.classifiedEdit.helpers({
  classified () {
    let classified = Classified.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let classifiedEdit = {};
    classifiedEdit._id = classified._id._str;
    classifiedEdit.name = classified.name;

    classifiedEdit.section = classified.section;
    pageSession.set('section',classified.section);
    classifiedEdit.type = classified.type;
    pageSession.set('type',classified.type);
    classifiedEdit.subtype = classified.subtype;
    pageSession.set('subtype',classified.subtype);
    classifiedEdit.contactInfo = classified.contactInfo;
    classifiedEdit.price = classified.price;
    classifiedEdit.parentType = classified.parentType;
    classifiedEdit.parentId = classified.parentId;
    pageSession.set('parentType',classified.parentType);
    pageSession.set('parentId',classified.parentId);

    classifiedEdit.tags = classified.tags;
    classifiedEdit.description = classified.description;
    classifiedEdit.shortDescription = classified.shortDescription;
    classifiedEdit.country = classified.address.addressCountry;
    classifiedEdit.postalCode = classified.address.postalCode;
    classifiedEdit.city = classified.address.codeInsee;
    classifiedEdit.cityName = classified.address.addressLocality;
    if(classified && classified.address && classified.address.streetAddress){
      classifiedEdit.streetAddress = classified.address.streetAddress;
    }
    if(classified && classified.address && classified.address.regionName){
      classifiedEdit.regionName = classified.address.regionName;
    }
    if(classified && classified.address && classified.address.depName){
      classifiedEdit.depName = classified.address.depName;
    }
    classifiedEdit.geoPosLatitude = classified.geo.latitude;
    classifiedEdit.geoPosLongitude = classified.geo.longitude;
    return classifiedEdit;
  },
  error () {
    return pageSession.get( 'error' );
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.classifiedFields.inheritsHelpersFrom('organizationsFields');
Template.classifiedFields.inheritsEventsFrom('organizationsFields');
Template.classifiedFields.inheritsHooksFrom('organizationsFields');

Template.classifiedFields.helpers({
  parentType (){
    return pageSession.get('parentType');
  },
  parentId (){
    return pageSession.get('parentId');
  },
  optionsParentId (parentType) {
    let optionsParent = false;
    if(Meteor.userId() && Citoyens && Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}) && parentType){
      console.log(parentType)
      if(parentType === 'organizations'){
        optionsParent = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}).listOrganizationsCreator();
      }else if(parentType === 'events'){
        optionsParent = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}).listEventsCreator();
      }else if(parentType === 'projects'){
        optionsParent = Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())}).listProjectsCreator();
      }else if(parentType === 'citoyens'){
        optionsParent =  Citoyens.find({_id:new Mongo.ObjectID(Meteor.userId())},{fields:{_id:1,name:1}})
      }
      if(optionsParent){
        console.log(optionsParent.fetch());
        return optionsParent.map(function (c) {
          return {label: c.name, value: c._id._str};
        });
      }
    }else{return false;}
  },
  section (){
    return pageSession.get('section');
  },
  type (){
    return pageSession.get('type');
  },
  optionsType (section) {
    if(section){
      console.log(section)
      const typeArray = TAPi18n.__(`schemas.classifiedrest.typeArray`,{ returnObjectTrees: true });
      if(section === 'Emplois'){
        console.log(typeArray);
        return typeArray['Emplois'];
        /*return [
          {label: 'Achats-Comptabilité-Gestion', value: 'Achats-Comptabilité-Gestion'},
          {label: 'Arts-Artisanat', value: 'Arts-Artisanat'},
          {label: 'Banque-Assurance', value: 'Banque-Assurance'},
          {label: 'Bâtiment-Travaux_Publics', value: 'Bâtiment-Travaux_Publics'},
          {label: 'Commerce-Vente', value: 'Commerce-Vente'},
          {label: 'Communication-Multimédia', value: 'Communication-Multimédia'},
          {label: 'Conseil-Etudes', value: 'Conseil-Etudes'},
          {label: 'Direction_Entreprise', value: 'Direction_Entreprise'},
          {label: 'Espaces_Naturels', value: 'Espaces_Naturels'},
          {label: 'Agriculture', value: 'Agriculture'},
          {label: 'Pêche', value: 'Pêche'},
          {label: 'Soins_aux_animaux', value: 'Soins_aux_animaux'},
          {label: 'Hôtellerie', value: 'Hôtellerie'},
          {label: 'Restauration', value: 'Restauration'},
          {label: 'Tourisme', value: 'Tourisme'},
          {label: 'Animation', value: 'Animation'},
          {label: 'Immobilier', value: 'Immobilier'},
          {label: 'Industrie', value: 'Industrie'},
          {label: 'Informatique-Télécommunication', value: 'Informatique-Télécommunication'},
          {label: 'Installation-Maintenance', value: 'Installation-Maintenance'},
          {label: 'Marketing-Stratégie_Commerciale', value: 'Marketing-Stratégie_Commerciale'},
          {label: 'Ressources_Humaines', value: 'Ressources_Humaines'},
          {label: 'Santé', value: 'Santé'},
          {label: 'Secrétariat-Assistanat', value: 'Secrétariat-Assistanat'},
          {label: 'Services_à_la_personne', value: 'Services_à_la_personne'},
          {label: 'Services_à_la_collectivité', value: 'Services_à_la_collectivité'},
          {label: 'Spectacle', value: 'Spectacle'},
          {label: 'Sport', value: 'Sport'},
          {label: 'Transport-Logistique', value: 'Transport-Logistique'}
      ];*/
      }else{
        console.log(typeArray);
        return typeArray['Autres'];
        /*return [
          {label: 'Technologie', value: 'Technologie'},
          {label: 'Immobilier', value: 'Immobilier'},
          {label: 'Véhicules', value: 'Véhicules'},
          {label: 'Maison', value: 'Maison'},
          {label: 'Loisirs', value: 'Loisirs'},
          {label: 'Mode', value: 'Mode'}
      ];*/
      }
    }else{return false;}
  },
  subtype (){
    return pageSession.get('subtype');
  },
  optionsSubtype (type) {
    if(type){
      console.log(type);
      const subtype = TAPi18n.__('schemas.classifiedrest.subtypeArray',{ returnObjectTrees: true });
      /*const subtype = {
        "Technologie":[
          {label: 'TV / Vidéo', value: 'TV / Vidéo'},
          {label: 'Informatique', value: 'Informatique'},
          {label: 'Tablettes', value: 'Tablettes'},
          {label: 'Téléphonie', value: 'Téléphonie'},
          {label: 'Appareils photos', value: 'Appareils photos'},
          {label: 'Appareil audio', value: 'Appareil audio'}
        ],
        "Immobilier":[
          {label: 'Maison', value: 'Maison'},
          {label: 'Appartement', value: 'Appartement'},
          {label: 'Terrain', value: 'Terrain'},
          {label: 'Parking', value: 'Parking'},
          {label: 'Bureaux', value: 'Bureaux'}
        ],
        "Véhicules":[
          {label: 'SUV', value: 'SUV'},
          {label: '4x4', value: '4x4'},
          {label: 'Utilitaire', value: 'Utilitaire'},
          {label: 'Moto', value: 'Moto'},
          {label: 'Scooter', value: 'Scooter'},
          {label: 'Bateau', value: 'Bateau'},
          {label: 'Voiturette', value: 'Voiturette'},
          {label: 'Vélos', value: 'Vélos'},
          {label: 'Équipement véhicule', value: 'Équipement véhicule'},
          {label: 'Équipement 2 roues', value: 'Équipement 2 roues'},
          {label: 'Équipement bateau', value: 'Équipement bateau'},
          {label: 'Équipement vélo', value: 'Équipement vélo'},
        ],
        "Maison":[
          {label: 'Electroménager', value: 'Electroménager'},
          {label: 'Mobilier', value: 'Mobilier'},
          {label: 'Équipement bébé', value: 'Équipement bébé'},
          {label: 'Animaux', value: 'Animaux'},
          {label: 'Divers', value: 'Divers'},
        ],
        "Loisirs":[
          {label: 'Sports', value: 'Sports'},
          {label: 'Instrument musique', value: 'Instrument musique'},
          {label: 'Sonorisation', value: 'Sonorisation'},
          {label: 'CD / DVD', value: 'CD / DVD'},
          {label: 'Jouet', value: 'Jouet'},
          {label: 'Jeux de société', value: 'Jeux de société'},
          {label: 'Livres / BD', value: 'Livres / BD'},
          {label: 'Collections', value: 'Collections'},
          {label: 'Bricolages', value: 'Bricolages'},
          {label: 'Jardinage', value: 'Jardinage'},
          {label: 'Art / Déco', value: 'Art / Déco'},
          {label: 'Modélisme', value: 'Modélisme'},
          {label: 'Puériculture', value: 'Puériculture'},
          {label: 'Animaux', value: 'Animaux'},
          {label: 'Divers', value: 'Divers'}
        ],
        "Mode":[
          {label: 'Vêtements', value: 'Vêtements'},
          {label: 'Chaussures', value: 'Chaussures'},
          {label: 'Accessoires', value: 'Accessoires'},
          {label: 'Montres', value: 'Montres'},
          {label: 'Bijoux', value: 'Bijoux'}
        ],
      };*/

      return subtype[type];
    }else{return false;}
  },
  /*
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
  */
  dataReadyParent() {
  return Template.instance().readyParent.get();
  }
});

Template.classifiedFields.onCreated(function () {
  const self = this;
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.readyParent = new ReactiveVar();

  /*pageSession.set('error', false );
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);*/

  self.autorun(function(c) {
    if(Router.current().params._id && Router.current().params.scope){
      Session.set('scopeId', Router.current().params._id);
      Session.set('scope', Router.current().params.scope);
      pageSession.set('parentType', Router.current().params.scope);
      pageSession.set('parentId', Router.current().params._id);
      c.stop();
    }
  });

});

Template.classifiedFields.onRendered(function() {
  const self = this;
  /*
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  let geolocate = Session.get('geolocate');
  if(geolocate && Router.current().route.getName()!="classifiedEdit"){
    var onOk=IonPopup.confirm({template:TAPi18n.__('Use your current location'),
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
      */

      self.autorun(function() {
        let parentType = pageSession.get('parentType');
        //console.log(`autorun ${parentType}`);
          if(parentType && Meteor.userId()){
            if( parentType === 'organizations'){
              const handleParent = self.subscribe('directoryListOrganizations','citoyens',Meteor.userId());
              self.readyParent.set(handleParent.ready());
            }else if( parentType === 'events'){
              const handleParent = self.subscribe('directoryListEvents','citoyens',Meteor.userId());
              self.readyParent.set(handleParent.ready());
            }else if( parentType === 'projects'){
              const handleParent = self.subscribe('directoryListProjects','citoyens',Meteor.userId());
              self.readyParent.set(handleParent.ready());
            }else if(parentType === 'citoyens'){
              const handleParent = self.subscribe('citoyen');
              self.readyParent.set(handleParent.ready());
            }

          }
      });

});

/*Template.classifiedFields.onDestroyed(function () {
this.$('textarea').atwho('destroy');
});*/

Template.classifiedFields.events({
  'change select[name="parentType"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'parentType', tmpl.$(e.currentTarget).val() );
    pageSession.set( 'parentId', false);
  },
  'change select[name="parentId"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'parentId', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="section"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'section', tmpl.$(e.currentTarget).val() );
    pageSession.set( 'type', false);
    pageSession.set( 'subtype', false);
  },
  'change select[name="type"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'type', tmpl.$(e.currentTarget).val() );
    pageSession.set( 'subtype', false);
  },
  'change select[name="subtype"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'subtype', tmpl.$(e.currentTarget).val() );
  },
  /*
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
*/
});

AutoForm.addHooks(['addClassified', 'editClassified'], {
  after: {
    method : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'classified'});
      }
    },
    "method-update" : function(error, result) {
      if (!error) {
        Router.go('detailList', {_id:result.data.id,scope:'classified'});
      }
    }
  },
  before: {
    method : function(doc, template) {
      console.log(doc);
      doc.parentType = pageSession.get('parentType');
      doc.parentId = pageSession.get('parentId');

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
      modifier["$set"].parentType = pageSession.get('parentType');
      modifier["$set"].parentId = pageSession.get('parentId');

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
      console.log(modifier["$set"].tags);

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
      //if (error.reason === 'Something went really bad  An classified with the same name allready exists') {
      //this.addStickyValidationError('name', error.reason.replace(":", " "));
      //this.addStickyValidationError('name', error.errorType , error.reason)
      //AutoForm.validateField(this.formId, 'name');
      //}
    //}
  }
});
