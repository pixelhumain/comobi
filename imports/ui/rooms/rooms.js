import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';

import { Rooms } from '../../api/rooms.js';

// submanager
import { newsListSubs } from '../../api/client/subsmanager.js';

import { pageSession } from '../../api/client/reactive.js';

import './rooms.html';

Template.detailRooms.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('detailRooms', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.detailRooms.helpers({
  rooms () {
    return Rooms.findOne({ _id: new Mongo.ObjectID(Router.current().params.roomId) });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.detailRooms_view.onCreated(function() {
  pageSession.set('search', null);
  pageSession.set('view', 'all');
  pageSession.set('selectstatus', null);
});

Template.detailRooms_view.helpers({
  search () {
    return pageSession.get('search');
  },
  view () {
    return pageSession.get('view');
  },
});

Template.listProposals_search.helpers({
  search () {
    return pageSession.get('search');
  },
});

Template.listProposals_search.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      pageSession.set('search', event.currentTarget.value);
    } else {
      pageSession.set('search', null);
    }
  }, 500),
});

Template.listProposals_button_bar.helpers({
  search () {
    return pageSession.get('search');
  },
  view () {
    return pageSession.get('view');
  },
});

Template.listProposals_button_bar.events({
  'click .all' (event) {
    event.preventDefault();
    pageSession.set('view', 'all');
  },
  'click .amendable' (event) {
    event.preventDefault();
    pageSession.set('view', 'amendable');
  },
  'click .tovote' (event) {
    event.preventDefault();
    pageSession.set('view', 'tovote');
  },
  'click .resolved' (event) {
    event.preventDefault();
    pageSession.set('view', 'resolved');
  },
  'click .proposals-disabled' (event) {
    event.preventDefault();
    pageSession.set('view', 'disabled');
  },
  'click .closed' (event) {
    event.preventDefault();
    pageSession.set('view', 'closed');
  },
  'click .archived' (event) {
    event.preventDefault();
    pageSession.set('view', 'archived');
  },
});

Template.listProposalsStatus.helpers({
  search () {
    return pageSession.get('search');
  },
});
