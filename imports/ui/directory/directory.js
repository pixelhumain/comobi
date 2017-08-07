import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

// submanager
import { directoryListSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Lists } from '../../api/lists.js';

import { nameToCollection } from '../../api/helpers.js';

import './directory.html';

import { pageDirectory } from '../../api/client/reactive.js';

import '../components/directory/list.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

// suivant le scope

Template.directory.onCreated(function() {
  this.ready = new ReactiveVar();
  pageDirectory.set('search', null);
  this.autorun(function() {
    pageDirectory.set('scopeId', Router.current().params._id);
    pageDirectory.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = directoryListSubs.subscribe('directoryList', Router.current().params.scope, Router.current().params._id);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.directory.onRendered(function() {

});

Template.directory.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    return undefined;
  },
  scopeDirectoryTemplate () {
    return `listDirectory${Router.current().params.scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  search () {
    return pageDirectory.get('search');
  },
});

Template.Directory_view.onCreated(function() {
  pageDirectory.set('search', null);
  pageDirectory.set('view', 'all');
  pageDirectory.set('selectorga', null);
});

Template.Directory_view.helpers({
  search () {
    return pageDirectory.get('search');
  },
  view () {
    return pageDirectory.get('view');
  },
});

Template.Directory_search.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.Directory_search.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      pageDirectory.set('search', event.currentTarget.value);
    } else {
      pageDirectory.set('search', null);
    }
  }, 500),
});

Template.Directory_button_bar.helpers({
  search () {
    return pageDirectory.get('search');
  },
  view () {
    return pageDirectory.get('view');
  },
});

Template.Directory_button_bar.events({
  'click .all' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'all');
  },
  'click .follows' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'follows');
  },
  'click .members' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'members');
  },
  'click .membersorganizations' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'membersorganizations');
  },
  'click .memberof' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'memberof');
  },
  'click .events' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'events');
  },
  'click .projects' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'projects');
  },
  'click .followers' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'followers');
  },
  'click .contributors' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'contributors');
  },
});

Template.listDirectoryFollows.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listDirectoryMemberOf.helpers({
  search () {
    return pageDirectory.get('search');
  },
  selectorga () {
    return pageDirectory.get('selectorga');
  },
  listOrganisationTypes () {
    const listSelect = Lists.findOne({ name: 'organisationTypes' });
    if (listSelect && listSelect.list) {
      return _.map(listSelect.list, (value, key) => ({ label: value, value: key }));
    }
    return undefined;
  },
});

Template.listDirectoryMembers.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listDirectoryMembersOrganizations.helpers({
  search () {
    return pageDirectory.get('search');
  },
  selectorga () {
    return pageDirectory.get('selectorga');
  },
  listOrganisationTypes () {
    const listSelect = Lists.findOne({ name: 'organisationTypes' });
    if (listSelect && listSelect.list) {
      return _.map(listSelect.list, (value, key) => ({ label: value, value: key }));
    }
    return undefined;
  },
});

Template.listDirectoryContributors.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listDirectoryProjects.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listDirectoryEvents.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listDirectoryFollowers.helpers({
  search () {
    return pageDirectory.get('search');
  },
});


Template.listDirectoryMemberOf.events({
  'click .selectorga' (event) {
    event.preventDefault();
    pageDirectory.set('selectorga', event.currentTarget.id);
  },
});

Template.listDirectoryMembersOrganizations.events({
  'click .selectorga' (event) {
    event.preventDefault();
    pageDirectory.set('selectorga', event.currentTarget.id);
  },
});
