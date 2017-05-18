import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Counts } from 'meteor/tmeasday:publish-counts';
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
import { ActivityStream } from '../../api/activitystream.js';
import { Cities } from '../../api/cities.js';

//submanager
import { dashboardSubs,listEventsSubs,listOrganizationsSubs,listProjectsSubs } from '../../api/client/subsmanager.js';

import { position } from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import './dashboard.html';

Template.dashboard.onCreated(function () {
  var self = this;
  self.ready = new ReactiveVar();
  if(!geoId.get('geoId')){
    const geoIdRandom = Random.id();
    geoId.set('geoId', geoIdRandom);
    console.log(geoId.get('geoId'));
  }
  //mettre sur layer ?
  Meteor.subscribe('citoyen');

  self.autorun(function(c) {
    const radius = position.getRadius();
    const latlngObj = position.getLatlngObject();
    if (radius && latlngObj) {
      console.log(geoId.get('geoId'));
      console.log('sub list dashboard geo radius');
      let handle = dashboardSubs.subscribe('geo.dashboard',geoId.get('geoId'), latlngObj, radius);
          self.ready.set(handle.ready());
    }else{
      console.log(geoId.get('geoId'));
      console.log('sub list dashboard city');
      let city = Session.get('city');
      if(city && city.geoShape && city.geoShape.coordinates){
        let handle = dashboardSubs.subscribe('geo.dashboard',geoId.get('geoId'), city.geoShape);
            self.ready.set(handle.ready());
      }
    }

  });

  self.autorun(function(c) {
    const latlngObj = position.getLatlngObject();
    if(latlngObj){
      Meteor.call('getcitiesbylatlng',latlngObj,function(error, result){
        if(result){
          //console.log('call city');
          Session.set('city', result);
        }
      });
    }
  });

});

Template.dashboard.onRendered(function() {

  const testgeo = () => {
    let geolocate = Session.get('geolocate');
    if(!Session.get('GPSstart') && geolocate && !position.getLatlng()){

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
          listOrganizationsSubs.clear();
          listProjectsSubs.clear();
          listCitoyensSubs.clear();
          dashboardSubs.clear();
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

Template.dashboard.helpers({
  city (){
    return Session.get('city');
  },
  radius (){
    return Session.get('radius');
  },
  meteorId (){
    return Meteor.userId();
  },
  geoId (scope){
    return `countScopeGeo.${geoId.get('geoId')}.${scope}`;
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});
