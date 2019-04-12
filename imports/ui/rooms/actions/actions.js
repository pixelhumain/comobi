import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { $ } from 'meteor/jquery';

import { Actions } from '../../../api/actions.js';
import { Events } from '../../../api/events.js';
import { Organizations } from '../../../api/organizations.js';
import { Projects } from '../../../api/projects.js';

import { nameToCollection } from '../../../api/helpers.js';

// submanager
import { newsListSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';

import './actions.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;

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

Template.detailViewActions.events({
  'click .action-assignme-js' (event) {
    event.preventDefault();
    Meteor.call('assignmeActionRooms', { id: pageSession.get('actionId') }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
});

Template.buttonsActions.events({
  'click .action-action-js' (event) {
    event.preventDefault();
    const action = $(event.currentTarget).data('action');
    Meteor.call('actionsType', { parentType: pageSession.get('scope'), parentId: pageSession.get('scopeId'), type: 'actions', id: pageSession.get('actionId'), name:'status', value: action }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
    });
  },
});

Template.actionsAdd.onCreated(function () {
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
  });
});

Template.actionsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.actionsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.actionsEdit.helpers({
  action () {
    const action = Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
    const actionEdit = {};
    actionEdit._id = action._id._str;
    actionEdit.name = action.name;
    actionEdit.startDate = action.startDate;
    actionEdit.endDate = action.endDate;
    if (action.startDate) {
      actionEdit.startDate = action.momentStartDate();
    }
    if (action.endDate) {
      actionEdit.endDate = action.momentEndDate();
    }
    actionEdit.description = action.description;
    actionEdit.tags = action.tags;
    actionEdit.urls = action.urls;
    return actionEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addAction', 'editAction'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
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
      doc.idParentRoom = pageSession.get('roomId');

      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('scope');
      modifier.$set.parentId = pageSession.get('scopeId');
      modifier.$set.idParentRoom = pageSession.get('roomId');

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
