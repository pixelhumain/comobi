import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

import { Actions } from '../../../api/actions.js';

// submanager
import { newsListSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';

import './actions.html';

Template.detailActions.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.detailActions.helpers({
  actions () {
    return Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
