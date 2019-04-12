import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { AutoForm } from 'meteor/aldeed:autoform';
import { IonActionSheet } from 'meteor/meteoric:ionic';

// collection
import { Events } from '../../../../api/events.js';
import { Organizations } from '../../../../api/organizations.js';
import { Projects } from '../../../../api/projects.js';
import { Citoyens } from '../../../../api/citoyens.js';
import { Comments } from '../../../../api/comments.js';

// submanager
import { singleSubs } from '../../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../../api/helpers.js';

import './comments.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageActionsComments');

Template.actionsDetailComments.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.roomId = Router.current().params.roomId;
  template.actionId = Router.current().params.actionId;
  this.autorun(function() {
    pageSession.set('scopeId', template._id);
    pageSession.set('scope', template.scope);
    pageSession.set('roomId', template.roomId);
    pageSession.set('actionId', template.actionId);
  });

  this.autorun(function() {
    if (template.scope && template._id && template.roomId && template.actionId) {
      // const handle = singleSubs.subscribe('detailActions', template.scope, template._id, template.roomId, template.actionId);
      const handle = singleSubs.subscribe('actionsDetailComments', template.scope, template._id, template.roomId, template.actionId);
      if (handle.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.actionsDetailComments.helpers({
  scope () {
    if (Template.instance().scope && Template.instance()._id && Template.instance().roomId && Template.instance().actionId && Template.instance().ready.get()) {
      const collection = nameToCollection(Template.instance().scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Template.instance()._id) });
    }
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.actionsDetailComments.events({
  'click .action-comment' (event) {
    const self = this;
    event.preventDefault();
    IonActionSheet.show({
      titleText: i18n.__('Actions Comment'),
      buttons: [
        { text: `${i18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: i18n.__('delete'),
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('commentsActionsEdit', { _id: Router.current().params._id, roomId: Router.current().params.roomId, actionId: Router.current().params.actionId, scope: Router.current().params.scope, commentId: self._id._str });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteComment', self._id._str, function() {
          Router.go('actionsDetail', { _id: Router.current().params._id, roomId: Router.current().params.roomId, actionId: Router.current().params.actionId, scope: Router.current().params.scope }, { replaceState: true });
        });
        return true;
      },
    });
  },
  'click .like-comment' (event) {
    Meteor.call('likeScope', this._id._str, 'comments');
    event.preventDefault();
  },
  'click .dislike-comment' (event) {
    Meteor.call('dislikeScope', this._id._str, 'comments');
    event.preventDefault();
  },
});


Template.commentsActionsAdd.onCreated(function () {
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  pageSession.set('error', false);
});

Template.commentsActionsAdd.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsActionsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.commentsActionsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  self.autorun(function() {
    // const handle = singleSubs.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    const handle = singleSubs.subscribe('actionsDetailComments', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    if (handle.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.commentsActionsEdit.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsActionsEdit.helpers({
  comment () {
    return Comments.findOne({ _id: new Mongo.ObjectID(Router.current().params.commentId) });
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addActionsComment', 'editActionsComment'], {
  before: {
    method(doc) {
      const actionId = pageSession.get('actionId');
      doc.contextType = 'actions';
      doc.contextId = actionId;
      return doc;
    },
    'method-update'(modifier) {
      const actionId = pageSession.get('actionId');
      modifier.$set.contextType = 'actions';
      modifier.$set.contextId = actionId;
      return modifier;
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(':', ' '));
      }
    }
  },
});

AutoForm.addHooks(['editActionsComment'], {
  after: {
    'method-update'(error) {
      if (!error) {
        Router.go('actionsDetailComments', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), actionId: pageSession.get('actionId') }, { replaceState: true });
      }
    },
  },
});
