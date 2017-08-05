import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

// submanager
import { collectionsListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Poi } from '../../api/poi.js';
import { Classified } from '../../api/classified.js';
import { Lists } from '../../api/lists.js';

import { nameToCollection } from '../../api/helpers.js';

import './collections.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Poi = Poi;
window.Classified = Classified;

import { pageCollections } from '../../api/client/reactive.js';

import '../components/directory/list.js';

// suivant le scope

Template.collections.onCreated(function() {
  self = this;
  this.ready = new ReactiveVar();
  pageCollections.set('search', null);
  this.autorun(function() {
    Session.set('scopeId', Router.current().params._id);
    Session.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = collectionsListSubs.subscribe('collectionsList', Router.current().params.scope, Router.current().params._id, 'favorites');
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.collections.onRendered(function() {
  self = this;
});

Template.collections.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  scopeCollectionsTemplate () {
    return `listCollections${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  search () {
    return pageCollections.get('search');
  },
});

Template.Collections_view.onCreated(function() {
  pageCollections.set('search', null);
  pageCollections.set('view', 'all');
});

Template.Collections_view.helpers({
  search () {
    return pageCollections.get('search');
  },
  view () {
    return pageCollections.get('view');
  },
});

Template.Collections_search.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.Collections_search.events({
  'keyup #search, change #search': _.throttle((event, template) => {
    if (event.currentTarget.value.length > 0) {
      console.log(event.currentTarget.value);
      pageCollections.set('search', event.currentTarget.value);
    } else {
      pageCollections.set('search', null);
    }
  }, 500),
});

Template.Collections_button_bar.helpers({
  search () {
    return pageCollections.get('search');
  },
  view () {
    return pageCollections.get('view');
  },
});

Template.Collections_button_bar.events({
  'click .all' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'all');
  },
  'click .citoyens' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'citoyens');
  },
  'click .organizations' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'organizations');
  },
  'click .poi' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'poi');
  },
  'click .classified' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'classified');
  },
  'click .events' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'events');
  },
  'click .projects' (evt) {
    evt.preventDefault();
    pageCollections.set('view', 'projects');
  },
});

Template.listCollectionsCitoyens.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.listCollectionsOrganizations.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.listCollectionsProjects.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.listCollectionsEvents.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.listCollectionsPoi.helpers({
  search () {
    return pageCollections.get('search');
  },
});

Template.listCollectionsClassified.helpers({
  search () {
    return pageCollections.get('search');
  },
});
