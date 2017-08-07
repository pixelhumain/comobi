import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { AutoForm } from 'meteor/aldeed:autoform';

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

const pageSession = new ReactiveDict('pageComments');

Template.newsDetailComments.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.newsId = Router.current().params.newsId;
  this.autorun(function() {
    pageSession.set('scopeId', template._id);
    pageSession.set('scope', template.scope);
  });

  this.autorun(function() {
    if (template.scope && template._id && template.newsId) {
      const handle = singleSubs.subscribe('scopeDetail', template.scope, template._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetailComments', template.scope, template._id, template.newsId);
      if (handle.ready() && handleScopeDetail.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.newsDetailComments.helpers({
  scope () {
    if (Template.instance().scope && Template.instance()._id && Template.instance().newsId && Template.instance().ready.get()) {
      const collection = nameToCollection(Template.instance().scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Template.instance()._id) });
    }
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.newsDetailComments.events({
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
          Router.go('commentsEdit', { _id: Router.current().params._id, newsId: Router.current().params.newsId, scope: Router.current().params.scope, commentId: self._id._str });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteComment', self._id._str, function() {
          Router.go('newsDetail', { _id: Router.current().params._id, newsId: Router.current().params.newsId, scope: Router.current().params.scope });
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


Template.commentsAdd.onCreated(function () {
  this.autorun(function() {
    pageSession.set('newsId', Router.current().params.newsId);
  });

  pageSession.set('error', false);
});

Template.commentsAdd.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.commentsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  self.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('newsId', Router.current().params.newsId);
  });

  self.autorun(function() {
    const handle = singleSubs.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    const handleScopeDetail = singleSubs.subscribe('newsDetailComments', Router.current().params.scope, Router.current().params._id, Router.current().params.newsId);
    if (handle.ready() && handleScopeDetail.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.commentsEdit.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsEdit.helpers({
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

AutoForm.addHooks(['addComment', 'editComment'], {
  before: {
    method(doc) {
      const newsId = pageSession.get('newsId');
      doc.contextType = 'news';
      doc.contextId = newsId;
      return doc;
    },
    'method-update'(modifier) {
      const newsId = pageSession.get('newsId');
      modifier.$set.contextType = 'news';
      modifier.$set.contextId = newsId;
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

AutoForm.addHooks(['editComment'], {
  after: {
    'method-update'(error) {
      if (!error) {
        Router.go('newsDetailComments', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), newsId: pageSession.get('newsId') });
      }
    },
  },
});
