import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Citoyens } from '../../api/citoyens.js';
import { Poi, BlockPoiRest } from '../../api/poi.js';

// submanager
import { listPoiSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';


Template.listPoi.onCreated(function () {
  pageSession.set('sortPoi', null);
  pageSession.set('searchPoi', null);
  scopeSubscribe(this, listPoiSubs, 'geo.scope', 'poi');
});


Template.listPoi.helpers({
  poi () {
    const searchPoi = pageSession.get('searchPoi');
    let query = {};
    query = queryGeoFilter(query);
    if (searchPoi) {
      query = searchQuery(query, searchPoi);
    }
    return Poi.find(query);
  },
  countPoi () {
    const searchPoi = pageSession.get('searchPoi');
    let query = {};
    query = queryGeoFilter(query);
    if (searchPoi) {
      query = searchQuery(query, searchPoi);
    }
    return Poi.find(query).count();
  },
  searchPoi () {
    return pageSession.get('searchPoi');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  typeI18n(type) {
    return `schemas.poirest.type.options.${type}`;
  },

});

Template.listPoi.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchPoi', event.currentTarget.value);
    } else {
      pageSession.set('searchPoi', null);
    }
  },
});

Template.poiAdd.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.poiEdit.onCreated(function () {
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

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', 'poi', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.poiBlockEdit.onCreated(function () {
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

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('block', Router.current().params.block);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', 'poi', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.poiAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.poiEdit.helpers({
  poi () {
    const poi = Poi.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const poiEdit = {};
    poiEdit._id = poi._id._str;
    poiEdit.name = poi.name;
    if (poi && poi.preferences) {
      poiEdit.preferences = {};
      if (poi.preferences.isOpenData === 'true') {
        poiEdit.preferences.isOpenData = true;
      } else {
        poiEdit.preferences.isOpenData = false;
      }
      if (poi.preferences.isOpenEdition === 'true') {
        poiEdit.preferences.isOpenEdition = true;
      } else {
        poiEdit.preferences.isOpenEdition = false;
      }
    }
    poiEdit.tags = poi.tags;
    poiEdit.urls = poi.urls;
    poiEdit.type = poi.type;
    poiEdit.parentType = poi.parentType;
    poiEdit.parentId = poi.parentId;
    pageSession.set('parentType', poi.parentType);
    pageSession.set('parentId', poi.parentId);

    poiEdit.description = poi.description;
    poiEdit.shortDescription = poi.shortDescription;
    poiEdit.country = poi.address.addressCountry;
    poiEdit.postalCode = poi.address.postalCode;
    poiEdit.city = poi.address.codeInsee;
    poiEdit.cityName = poi.address.addressLocality;
    if (poi && poi.address && poi.address.streetAddress) {
      poiEdit.streetAddress = poi.address.streetAddress;
    }
    if (poi && poi.address && poi.address.regionName) {
      poiEdit.regionName = poi.address.regionName;
    }
    if (poi && poi.address && poi.address.depName) {
      poiEdit.depName = poi.address.depName;
    }
    poiEdit.geoPosLatitude = poi.geo.latitude;
    poiEdit.geoPosLongitude = poi.geo.longitude;
    return poiEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.poiBlockEdit.helpers({
  poi () {
    const poi = Poi.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const poiEdit = {};
    poiEdit._id = poi._id._str;
    if (Router.current().params.block === 'descriptions') {
      poiEdit.description = poi.description;
      poiEdit.shortDescription = poi.shortDescription;
    } else if (Router.current().params.block === 'info') {
      poiEdit.name = poi.name;
      if (poi.tags) {
        poiEdit.tags = poi.tags;
      }
    } else if (Router.current().params.block === 'locality') {
      if (poi && poi.address) {
        poiEdit.country = poi.address.addressCountry;
        poiEdit.postalCode = poi.address.postalCode;
        poiEdit.city = poi.address.codeInsee;
        poiEdit.cityName = poi.address.addressLocality;
        if (poi && poi.address && poi.address.streetAddress) {
          poiEdit.streetAddress = poi.address.streetAddress;
        }
        if (poi && poi.address && poi.address.regionName) {
          poiEdit.regionName = poi.address.regionName;
        }
        if (poi && poi.address && poi.address.depName) {
          poiEdit.depName = poi.address.depName;
        }
        poiEdit.geoPosLatitude = poi.geo.latitude;
        poiEdit.geoPosLongitude = poi.geo.longitude;
      }
    } else if (Router.current().params.block === 'preferences') {
      if (poi && poi.preferences) {
        poiEdit.preferences = {};
        if (poi.preferences.isOpenData === true) {
          poiEdit.preferences.isOpenData = true;
        } else {
          poiEdit.preferences.isOpenData = false;
        }
        if (poi.preferences.isOpenEdition === true) {
          poiEdit.preferences.isOpenEdition = true;
        } else {
          poiEdit.preferences.isOpenEdition = false;
        }
      }
    }
    return poiEdit;
  },
  blockSchema() {
    return BlockPoiRest[Router.current().params.block];
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

Template.poiFields.inheritsHelpersFrom('organizationsFields');
Template.poiFields.inheritsEventsFrom('organizationsFields');
Template.poiFields.inheritsHooksFrom('organizationsFields');

Template.poiFields.helpers({
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
  dataReadyParent() {
    return Template.instance().readyParent.get();
  },
});

Template.poiFields.onCreated(function () {
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

Template.poiFields.onRendered(function() {
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

Template.poiFields.events({
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
});

AutoForm.addHooks(['addPoi', 'editPoi'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'poi' }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'poi' }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.parentType = pageSession.get('parentType');
      doc.parentId = pageSession.get('parentId');
      doc = matchTags(doc, pageSession.get('tags'));
      return doc;
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

AutoForm.addHooks(['editBlockPoi'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('block') !== 'preferences') {
          Router.go('detailList', { _id: pageSession.get('scopeId'), scope: 'poi' }, { replaceState: true });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const scope = 'poi';
      const block = pageSession.get('block');
      if (modifier && modifier.$set) {
        modifier.$set = matchTags(modifier.$set, pageSession.get('tags'));
      } else {
        modifier.$set = {};
      }
      modifier.$set.typeElement = scope;
      modifier.$set.block = block;
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
