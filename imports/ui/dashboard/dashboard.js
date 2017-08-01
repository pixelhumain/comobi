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
import { dashboardSubs,scopeSubscribe } from '../../api/client/subsmanager.js';

import { position } from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import './dashboard.html';

Template.dashboard.onCreated(function () {

  scopeSubscribe(this,dashboardSubs,'geo.dashboard','dashboard');

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
