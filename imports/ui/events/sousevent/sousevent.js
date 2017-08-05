import './sousevent.html';

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
// import { Mapbox } from 'meteor/communecter:mapbox';


// collections
import { Events } from '../../../api/events.js';

// submanager
import { listSousEventsSubs } from '../../../api/client/subsmanager.js';

Template.listeventSous.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();


  self.autorun(function(c) {
    Session.set('scopeId', Router.current().params._id);
  });

  // sub listEvents
  self.autorun(function(c) {
    const handle = listSousEventsSubs.subscribe('listeventSous', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listeventSous.helpers({
  events () {
    return Events.find({ parentId: Router.current().params._id });
  },
  countEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
