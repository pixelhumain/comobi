import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Router } from 'meteor/iron:router';

import { Rooms } from '../../api/rooms.js';

// submanager
import { newsListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';

import { nameToCollection } from '../../api/helpers.js';

import { pageSession } from '../../api/client/reactive.js';

import './rooms.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;

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
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.detailRooms_view.onCreated(function() {
  pageSession.set('search', null);
  pageSession.set('view', 'all');
  pageSession.set('viewActions', 'all')
  pageSession.set('selectstatus', null);
});

Template.detailRooms_view.helpers({
  search () {
    return pageSession.get('search');
  },
  view () {
    return pageSession.get('view');
  },
  viewActions () {
    return pageSession.get('viewActions');
  },
});

Template.listRooms_search.helpers({
  search () {
    return pageSession.get('search');
  },
});

Template.listRooms_search.events({
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

Template.listActions_button_bar.helpers({
  search () {
    return pageSession.get('search');
  },
  viewActions () {
    return pageSession.get('viewActions');
  },
});

Template.listActions_button_bar.events({
  'click .all' (event) {
    event.preventDefault();
    pageSession.set('viewActions', 'all');
  },
  'click .todo' (event) {
    event.preventDefault();
    pageSession.set('viewActions', 'todo');
  },
  'click .actions-disabled' (event) {
    event.preventDefault();
    pageSession.set('viewActions', 'disabled');
  },
  'click .done' (event) {
    event.preventDefault();
    pageSession.set('viewActions', 'done');
  },
});

Template.listActionsStatus.helpers({
  search () {
    return pageSession.get('search');
  },
});

Template.listProposalsStatus.helpers({
  search () {
    return pageSession.get('search');
  },
});

Template.listResolutions.helpers({
  search () {
    return pageSession.get('search');
  },
});

Template.roomsAdd.onCreated(function () {
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });
});

Template.roomsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('detailRooms', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.roomsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.roomsEdit.helpers({
  room () {
    const room = Rooms.findOne({ _id: new Mongo.ObjectID(Router.current().params.roomId) });
    const roomEdit = {};
    roomEdit._id = room._id._str;
    roomEdit.name = room.name;
    roomEdit.description = room.description;
    roomEdit.roles = room.roles;
    return roomEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addRoom', 'editRoom'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: result.data.id }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.parentType = pageSession.get('scope');
      doc.parentId = pageSession.get('scopeId');
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('scope');
      modifier.$set.parentId = pageSession.get('scopeId');
      return modifier;
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(': ', ''));
      }
    }
  },
});
