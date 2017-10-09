import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

import { Resolutions } from '../../../api/resolutions.js';

// submanager
import { newsListSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';

import './resolutions.html';

Template.detailResolutions.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('resolutionId', Router.current().params.resolutionId);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('detailResolutions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.resolutionId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.detailResolutions.helpers({
  resolutions () {
    return Resolutions.findOne({ _id: new Mongo.ObjectID(Router.current().params.resolutionId) });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
