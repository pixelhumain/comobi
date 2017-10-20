import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
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

const pageSession = new ReactiveDict('pageProposalsComments');

Template.proposalsDetailComments.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.roomId = Router.current().params.roomId;
  template.proposalId = Router.current().params.proposalId;
  this.autorun(function() {
    pageSession.set('scopeId', template._id);
    pageSession.set('scope', template.scope);
    pageSession.set('roomId', template.roomId);
    pageSession.set('proposalId', template.proposalId);
  });

  this.autorun(function() {
    if (template.scope && template._id && template.roomId && template.proposalId) {
      // const handle = singleSubs.subscribe('detailProposals', template.scope, template._id, template.roomId, template.proposalId);
      const handle = singleSubs.subscribe('proposalsDetailComments', template.scope, template._id, template.roomId, template.proposalId);
      if (handle.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.proposalsDetailComments.helpers({
  scope () {
    if (Template.instance().scope && Template.instance()._id && Template.instance().roomId && Template.instance().proposalId && Template.instance().ready.get()) {
      const collection = nameToCollection(Template.instance().scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Template.instance()._id) });
    }
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.proposalsDetailComments.events({
  'click .action-comment' (event) {
    const self = this;
    event.preventDefault();
    IonActionSheet.show({
      titleText: TAPi18n.__('Actions Comment'),
      buttons: [
        { text: `${TAPi18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: TAPi18n.__('delete'),
      cancelText: TAPi18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('commentsProposalsEdit', { _id: Router.current().params._id, roomId: Router.current().params.roomId, proposalId: Router.current().params.proposalId, scope: Router.current().params.scope, commentId: self._id._str });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteComment', self._id._str, function() {
          Router.go('proposalsDetail', { _id: Router.current().params._id, roomId: Router.current().params.roomId, proposalId: Router.current().params.proposalId, scope: Router.current().params.scope }, { replaceState: true });
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


Template.commentsProposalsAdd.onCreated(function () {
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
  });

  pageSession.set('error', false);
});

Template.commentsProposalsAdd.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsProposalsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.commentsProposalsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
  });

  self.autorun(function() {
    // const handle = singleSubs.subscribe('detailProposals', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.proposalId);
    const handle = singleSubs.subscribe('proposalsDetailComments', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.proposalId);
    if (handle.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.commentsProposalsEdit.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsProposalsEdit.helpers({
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

AutoForm.addHooks(['addProposalsComment', 'editProposalsComment'], {
  before: {
    method(doc) {
      const proposalId = pageSession.get('proposalId');
      doc.contextType = 'proposals';
      doc.contextId = proposalId;
      return doc;
    },
    'method-update'(modifier) {
      const proposalId = pageSession.get('proposalId');
      modifier.$set.contextType = 'proposals';
      modifier.$set.contextId = proposalId;
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

AutoForm.addHooks(['editProposalsComment'], {
  after: {
    'method-update'(error) {
      if (!error) {
        Router.go('proposalsDetailComments', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), proposalId: pageSession.get('proposalId') }, { replaceState: true });
      }
    },
  },
});
