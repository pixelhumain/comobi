import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { AutoForm } from 'meteor/aldeed:autoform';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

// submanager
import { singleSubs } from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';

import './share.html';

import '../components/news/card.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageShare');

Template.share.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    if (Router.current().params.newsId) {
      pageSession.set('newsId', Router.current().params.newsId);
    }
  });
  /* share peut être : event,project,organization
  mais aussi une news

  */
  this.autorun(function() {
    if (Router.current().params.newsId) {
      const handle = singleSubs.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
      const handleScopeDetail = singleSubs.subscribe('newsDetail', Router.current().params.scope, Router.current().params._id, Router.current().params.newsId);
      if (handle.ready() && handleScopeDetail.ready()) {
        // console.log('subici');
        template.ready.set(handle.ready());
      }
    } else {
      const handle = singleSubs.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
      if (handle.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.share.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    return undefined;
  },
  newsId() {
    return Router.current().params.newsId;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.shareAdd.onCreated(function () {
  pageSession.set('error', false);
});

Template.shareAdd.onRendered(function () {
  pageSession.set('error', false);
});

Template.shareAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});


AutoForm.addHooks(['addShare'], {
  after: {
    method(error) {
      if (!error) {
        // console.log('ici');
        const scope = pageSession.get('scope');
        const scopeId = pageSession.get('scopeId');
        Router.go('detailList', { _id: scopeId, scope }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      // console.log(doc);
      const scope = pageSession.get('scope');
      const scopeId = pageSession.get('scopeId');
      const newsId = pageSession.get('newsId');
      if (scope && scopeId && newsId) {
        doc.parentType = 'news';
        doc.parentId = newsId;
      } else {
        doc.parentType = scope;
        doc.parentId = scopeId;
      }
      return doc;
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
