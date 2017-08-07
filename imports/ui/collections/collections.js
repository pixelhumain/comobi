import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

// submanager
import { collectionsListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Poi } from '../../api/poi.js';
import { Classified } from '../../api/classified.js';

import { nameToCollection } from '../../api/helpers.js';

import { pageCollections } from '../../api/client/reactive.js';

import '../components/directory/list.js';

import './collections.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Poi = Poi;
window.Classified = Classified;


// suivant le scope

Template.collections.onCreated(function() {
  this.ready = new ReactiveVar();
  pageCollections.set('search', null);
  this.autorun(function() {
    pageCollections.set('scopeId', Router.current().params._id);
    pageCollections.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = collectionsListSubs.subscribe('collectionsList', Router.current().params.scope, Router.current().params._id, 'favorites');
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.collections.onRendered(function() {
});

Template.collections.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    return undefined;
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
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
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
  'click .all' (event) {
    event.preventDefault();
    pageCollections.set('view', 'all');
  },
  'click .citoyens' (event) {
    event.preventDefault();
    pageCollections.set('view', 'citoyens');
  },
  'click .organizations' (event) {
    event.preventDefault();
    pageCollections.set('view', 'organizations');
  },
  'click .poi' (event) {
    event.preventDefault();
    pageCollections.set('view', 'poi');
  },
  'click .classified' (event) {
    event.preventDefault();
    pageCollections.set('view', 'classified');
  },
  'click .events' (event) {
    event.preventDefault();
    pageCollections.set('view', 'events');
  },
  'click .projects' (event) {
    event.preventDefault();
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
