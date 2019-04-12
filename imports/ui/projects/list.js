import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Citoyens } from '../../api/citoyens.js';
import { Projects, BlockProjectsRest } from '../../api/projects.js';

// submanager
import { listProjectsSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';


Template.listProjects.onCreated(function () {
  pageSession.set('sortProjects', null);
  pageSession.set('searchProjects', null);
  scopeSubscribe(this, listProjectsSubs, 'geo.scope', 'projects');
});


Template.listProjects.helpers({
  projects () {
    const searchProjects = pageSession.get('searchProjects');
    let query = {};
    query = queryGeoFilter(query);
    if (searchProjects) {
      query = searchQuery(query, searchProjects);
    }
    return Projects.find(query);
  },
  countProjects () {
    const searchProjects = pageSession.get('searchProjects');
    let query = {};
    query = queryGeoFilter(query);
    if (searchProjects) {
      query = searchQuery(query, searchProjects);
    }
    return Projects.find(query).count();
  },
  searchProjects () {
    return pageSession.get('searchProjects');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjects.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchProjects', event.currentTarget.value);
    } else {
      pageSession.set('searchProjects', null);
    }
  },
});

Template.projectsAdd.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('localityId', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.projectsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('localityId', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', 'projects', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.projectsBlockEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('localityId', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('block', Router.current().params.block);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', 'projects', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.projectsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.projectsEdit.helpers({
  project () {
    const project = Projects.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const projectEdit = {};
    projectEdit._id = project._id._str;
    projectEdit.name = project.name;
    projectEdit.url = project.url;
    projectEdit.startDate = project.startDate;
    projectEdit.endDate = project.endDate;
    if (project && project.preferences) {
      projectEdit.preferences = {};
      if (project.preferences.isOpenData === 'true') {
        projectEdit.preferences.isOpenData = true;
      } else {
        projectEdit.preferences.isOpenData = false;
      }
      if (project.preferences.isOpenEdition === 'true') {
        projectEdit.preferences.isOpenEdition = true;
      } else {
        projectEdit.preferences.isOpenEdition = false;
      }
    }
    projectEdit.tags = project.tags;
    projectEdit.description = project.description;
    projectEdit.shortDescription = project.shortDescription;
    projectEdit.country = project.address.addressCountry;
    projectEdit.postalCode = project.address.postalCode;
    projectEdit.city = project.address.codeInsee;
    projectEdit.cityName = project.address.addressLocality;
    if (project && project.address && project.address.streetAddress) {
      projectEdit.streetAddress = project.address.streetAddress;
    }
    if (project && project.address && project.address.regionName) {
      projectEdit.regionName = project.address.regionName;
    }
    if (project && project.address && project.address.depName) {
      projectEdit.depName = project.address.depName;
    }
    if (project && project.address && project.address.localityId) {
      projectEdit.localityId = project.address.localityId;
    }
    projectEdit.geoPosLatitude = project.geo.latitude;
    projectEdit.geoPosLongitude = project.geo.longitude;
    return projectEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.projectsBlockEdit.helpers({
  project () {
    const project = Projects.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const projectEdit = {};
    projectEdit._id = project._id._str;
    if (Router.current().params.block === 'descriptions') {
      projectEdit.description = project.description;
      projectEdit.shortDescription = project.shortDescription;
    } else if (Router.current().params.block === 'info') {
      projectEdit.name = project.name;
      if (project.tags) {
        projectEdit.tags = project.tags;
      }
      if (project.properties && project.properties.avancement) {
        projectEdit.avancement = project.properties.avancement;
      }
      // projectEdit.email = project.email;
      projectEdit.url = project.url;
      /* if(project.telephone){
        if(project.telephone.fixe){
          projectEdit.fixe = project.telephone.fixe.join();
        }
        if(project.telephone.mobile){
          projectEdit.mobile = project.telephone.mobile.join();
        }
        if(project.telephone.fax){
          projectEdit.fax = project.telephone.fax.join();
        }
      } */
    } else if (Router.current().params.block === 'network') {
      if (project.socialNetwork) {
        if (project.socialNetwork.instagram) {
          projectEdit.instagram = project.socialNetwork.instagram;
        }
        if (project.socialNetwork.skype) {
          projectEdit.skype = project.socialNetwork.skype;
        }
        if (project.socialNetwork.github) {
          projectEdit.github = project.socialNetwork.github;
        }
        if (project.socialNetwork.twitter) {
          projectEdit.twitter = project.socialNetwork.twitter;
        }
        if (project.socialNetwork.facebook) {
          projectEdit.facebook = project.socialNetwork.facebook;
        }
      }
    } else if (Router.current().params.block === 'when') {
      projectEdit.startDate = project.startDate;
      projectEdit.endDate = project.endDate;
    } else if (Router.current().params.block === 'locality') {
      if (project && project.address) {
        projectEdit.country = project.address.addressCountry;
        projectEdit.postalCode = project.address.postalCode;
        projectEdit.city = project.address.codeInsee;
        projectEdit.cityName = project.address.addressLocality;
        if (project && project.address && project.address.streetAddress) {
          projectEdit.streetAddress = project.address.streetAddress;
        }
        if (project && project.address && project.address.regionName) {
          projectEdit.regionName = project.address.regionName;
        }
        if (project && project.address && project.address.depName) {
          projectEdit.depName = project.address.depName;
        }
        if (project && project.address && project.address.localityId) {
          projectEdit.localityId = project.address.localityId;
        }
        projectEdit.geoPosLatitude = project.geo.latitude;
        projectEdit.geoPosLongitude = project.geo.longitude;
      }
    } else if (Router.current().params.block === 'preferences') {
      if (project && project.preferences) {
        projectEdit.preferences = {};
        if (project.preferences.isOpenData === true) {
          projectEdit.preferences.isOpenData = true;
        } else {
          projectEdit.preferences.isOpenData = false;
        }
        if (project.preferences.isOpenEdition === true) {
          projectEdit.preferences.isOpenEdition = true;
        } else {
          projectEdit.preferences.isOpenEdition = false;
        }
      }
    }
    return projectEdit;
  },
  blockSchema() {
    return BlockProjectsRest[Router.current().params.block];
  },
  block() {
    return Router.current().params.block;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.projectsFields.inheritsHelpersFrom('organizationsFields');
Template.projectsFields.inheritsEventsFrom('organizationsFields');
Template.projectsFields.inheritsHooksFrom('organizationsFields');

Template.projectsFields.helpers({
  parentType () {
    return pageSession.get('parentType');
  },
  parentId () {
    return pageSession.get('parentId');
  },
  optionsParentId (parentType) {
    let optionsParent = false;
    if (Meteor.userId() && Citoyens && Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }) && parentType) {
      // console.log(parentType);
      if (parentType === 'organizations') {
        optionsParent = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listOrganizationsCreator();
      } else if (parentType === 'citoyens') {
        optionsParent = Citoyens.find({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { _id: 1, name: 1 } });
      }
      if (optionsParent) {
        // console.log(optionsParent.fetch());
        return optionsParent.map(function (c) {
          return { label: c.name, value: c._id._str };
        });
      }
    }
    return false;
  },
  dataReadyParent() {
    return Template.instance().readyParent.get();
  },
});

Template.projectsFields.onCreated(function () {
  const self = this;
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.readyParent = new ReactiveVar();

  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('localityId', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  self.autorun(function(c) {
    if (Router.current().params._id && Router.current().params.scope) {
      pageSession.set('scopeId', Router.current().params._id);
      pageSession.set('scope', Router.current().params.scope);
      pageSession.set('parentType', Router.current().params.scope);
      pageSession.set('parentId', Router.current().params._id);
      c.stop();
    }
  });
});

Template.projectsFields.onRendered(function() {
  const self = this;

  self.autorun(function() {
    const parentType = pageSession.get('parentType');
    // console.log(`autorun ${parentType}`);
    if (parentType && Meteor.userId()) {
      if (parentType === 'organizations') {
        const handleParent = self.subscribe('directoryListOrganizations', 'citoyens', Meteor.userId());
        self.readyParent.set(handleParent.ready());
      } else if (parentType === 'citoyens') {
        const handleParent = self.subscribe('citoyen');
        self.readyParent.set(handleParent.ready());
      }
    }
  });
});

Template.projectsFields.events({
  'change select[name="parentType"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('parentType', instance.$(event.currentTarget).val());
    pageSession.set('parentId', false);
  },
  'change select[name="parentId"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('parentId', instance.$(event.currentTarget).val());
  },
});

AutoForm.addHooks(['addProject', 'editProject'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'projects' }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'projects' }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      // console.log(doc);
      doc.parentType = pageSession.get('parentType');
      doc.parentId = pageSession.get('parentId');
      doc = matchTags(doc, pageSession.get('tags'));
      // console.log(doc.tags);
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('parentType');
      modifier.$set.parentId = pageSession.get('parentId');
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

AutoForm.addHooks(['editBlockProject'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('block') !== 'preferences') {
          Router.go('detailList', { _id: pageSession.get('scopeId'), scope: 'projects' }, { replaceState: true });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const scope = 'projects';
      const block = pageSession.get('block');
      if (modifier && modifier.$set) {
        modifier.$set = matchTags(modifier.$set, pageSession.get('tags'));
      } else {
        modifier.$set = {};
      }
      modifier.$set.typeElement = scope;
      modifier.$set.block = block;
      // console.log(modifier.$set);
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
