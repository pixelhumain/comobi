import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Citoyens } from '../../api/citoyens.js';
import { Classified } from '../../api/classified.js';

// submanager
import { listClassifiedSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';


Template.listClassified.onCreated(function () {
  pageSession.set('sortClassified', null);
  pageSession.set('searchClassified', null);
  scopeSubscribe(this, listClassifiedSubs, 'geo.scope', 'classified');
});

Template.listClassified.helpers({
  classified () {
    const searchClassified = pageSession.get('searchClassified');
    let query = {};
    query = queryGeoFilter(query);
    if (searchClassified) {
      query = searchQuery(query, searchClassified);
    }
    return Classified.find(query);
  },
  countClassified () {
    const searchClassified = pageSession.get('searchClassified');
    let query = {};
    query = queryGeoFilter(query);
    if (searchClassified) {
      query = searchQuery(query, searchClassified);
    }
    return Classified.find(query).count();
  },
  searchClassified () {
    return pageSession.get('searchClassified');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  typeI18n(type) {
    return `schemas.classifiedrest.type.options.${type}`;
  },

});

Template.listClassified.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchClassified', event.currentTarget.value);
    } else {
      pageSession.set('searchClassified', null);
    }
  },
});

Template.classifiedAdd.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
  pageSession.set('section', null);
  pageSession.set('type', null);
  pageSession.set('subtype', null);
});

Template.classifiedEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
  pageSession.set('section', null);
  pageSession.set('type', null);
  pageSession.set('subtype', null);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', 'classified', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});


Template.classifiedAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.classifiedEdit.helpers({
  classified () {
    const classified = Classified.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const classifiedEdit = {};
    classifiedEdit._id = classified._id._str;
    classifiedEdit.name = classified.name;

    classifiedEdit.section = classified.section;
    pageSession.set('section', classified.section);
    classifiedEdit.type = classified.type;
    pageSession.set('type', classified.type);
    classifiedEdit.subtype = classified.subtype;
    pageSession.set('subtype', classified.subtype);
    classifiedEdit.contactInfo = classified.contactInfo;
    classifiedEdit.price = classified.price;
    classifiedEdit.parentType = classified.parentType;
    classifiedEdit.parentId = classified.parentId;
    pageSession.set('parentType', classified.parentType);
    pageSession.set('parentId', classified.parentId);

    classifiedEdit.tags = classified.tags;
    classifiedEdit.description = classified.description;
    classifiedEdit.shortDescription = classified.shortDescription;
    classifiedEdit.country = classified.address.addressCountry;
    classifiedEdit.postalCode = classified.address.postalCode;
    classifiedEdit.city = classified.address.codeInsee;
    classifiedEdit.cityName = classified.address.addressLocality;
    if (classified && classified.address && classified.address.streetAddress) {
      classifiedEdit.streetAddress = classified.address.streetAddress;
    }
    if (classified && classified.address && classified.address.regionName) {
      classifiedEdit.regionName = classified.address.regionName;
    }
    if (classified && classified.address && classified.address.depName) {
      classifiedEdit.depName = classified.address.depName;
    }
    classifiedEdit.geoPosLatitude = classified.geo.latitude;
    classifiedEdit.geoPosLongitude = classified.geo.longitude;
    return classifiedEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.classifiedFields.inheritsHelpersFrom('organizationsFields');
Template.classifiedFields.inheritsEventsFrom('organizationsFields');
Template.classifiedFields.inheritsHooksFrom('organizationsFields');

Template.classifiedFields.helpers({
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
      } else if (parentType === 'events') {
        optionsParent = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listEventsCreator();
      } else if (parentType === 'projects') {
        optionsParent = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listProjectsCreator();
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
  section () {
    return pageSession.get('section');
  },
  type () {
    return pageSession.get('type');
  },
  optionsType (section) {
    if (section) {
      // console.log(section);
      const typeArray = TAPi18n.__('schemas.classifiedrest.typeArray', { returnObjectTrees: true });
      if (section === 'Emplois') {
        // console.log(typeArray);
        return typeArray.Emplois;
      }
      // console.log(typeArray);
      return typeArray.Autres;
    } return false;
  },
  subtype () {
    return pageSession.get('subtype');
  },
  optionsSubtype (type) {
    if (type) {
      // console.log(type);
      const subtype = TAPi18n.__('schemas.classifiedrest.subtypeArray', { returnObjectTrees: true });
      return subtype[type];
    } return false;
  },
  dataReadyParent() {
    return Template.instance().readyParent.get();
  },
});

Template.classifiedFields.onCreated(function () {
  const self = this;
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.readyParent = new ReactiveVar();

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

Template.classifiedFields.onRendered(function() {
  const self = this;

  self.autorun(function() {
    const parentType = pageSession.get('parentType');
    // console.log(`autorun ${parentType}`);
    if (parentType && Meteor.userId()) {
      if (parentType === 'organizations') {
        const handleParent = self.subscribe('directoryListOrganizations', 'citoyens', Meteor.userId());
        self.readyParent.set(handleParent.ready());
      } else if (parentType === 'events') {
        const handleParent = self.subscribe('directoryListEvents', 'citoyens', Meteor.userId());
        self.readyParent.set(handleParent.ready());
      } else if (parentType === 'projects') {
        const handleParent = self.subscribe('directoryListProjects', 'citoyens', Meteor.userId());
        self.readyParent.set(handleParent.ready());
      } else if (parentType === 'citoyens') {
        const handleParent = self.subscribe('citoyen');
        self.readyParent.set(handleParent.ready());
      }
    }
  });
});


Template.classifiedFields.events({
  'change select[name="parentType"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('parentType', instance.$(event.currentTarget).val());
    pageSession.set('parentId', false);
  },
  'change select[name="parentId"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('parentId', instance.$(event.currentTarget).val());
  },
  'change select[name="section"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('section', instance.$(event.currentTarget).val());
    pageSession.set('type', false);
    pageSession.set('subtype', false);
  },
  'change select[name="type"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('type', instance.$(event.currentTarget).val());
    pageSession.set('subtype', false);
  },
  'change select[name="subtype"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('subtype', instance.$(event.currentTarget).val());
  },
});

AutoForm.addHooks(['addClassified', 'editClassified'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'classified' }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'classified' }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.parentType = pageSession.get('parentType');
      doc.parentId = pageSession.get('parentId');
      return matchTags(doc, pageSession.get('tags'));
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('parentType');
      modifier.$set.parentId = pageSession.get('parentId');
      modifier.$set = matchTags(modifier.$set, pageSession.get('tags'));
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
