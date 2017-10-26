import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Citoyens } from '../../api/citoyens.js';
import { Projects } from '../../api/projects.js';
import { Organizations } from '../../api/organizations.js';
import { Events, BlockEventsRest } from '../../api/events.js';

// submanager
import { listEventsSubs, listsSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';

Template.listEvents.onCreated(function () {
  pageSession.set('sortEvents', null);
  pageSession.set('searchEvents', null);
  scopeSubscribe(this, listEventsSubs, 'geo.scope', 'events');
});


Template.listEvents.helpers({
  events () {
    const inputDate = new Date();
    const sortEvents = pageSession.get('sortEvents');
    const searchEvents = pageSession.get('searchEvents');
    let query = {};
    query = queryGeoFilter(query);
    if (sortEvents === 'Current') {
      query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
    } else if (sortEvents === 'Upcoming') {
      query.startDate = { $gte: inputDate };
    } else if (sortEvents === 'History') {
      query.endDate = { $lte: inputDate };
    }
    if (searchEvents) {
      query = searchQuery(query, searchEvents);
    }
    return Events.find(query);
  },
  countEvents () {
    const inputDate = new Date();
    const sortEvents = pageSession.get('sortEvents');
    const searchEvents = pageSession.get('searchEvents');
    let query = {};
    query = queryGeoFilter(query);
    if (sortEvents === 'Current') {
      query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
    } else if (sortEvents === 'Upcoming') {
      query.startDate = { $gte: inputDate };
    } else if (sortEvents === 'History') {
      query.endDate = { $lte: inputDate };
    }
    if (searchEvents) {
      query = searchQuery(query, searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsCurrent () {
    const inputDate = new Date();
    const searchEvents = pageSession.get('searchEvents');
    let query = {};
    query = queryGeoFilter(query);
    query.startDate = { $lte: inputDate };
    query.endDate = { $gte: inputDate };
    if (searchEvents) {
      query = searchQuery(query, searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsUpcoming () {
    const inputDate = new Date();
    const searchEvents = pageSession.get('searchEvents');
    let query = {};
    query = queryGeoFilter(query);
    query.startDate = { $gte: inputDate };
    if (searchEvents) {
      query = searchQuery(query, searchEvents);
    }
    return Events.find(query).count();
  },
  countEventsHistory () {
    const inputDate = new Date();
    const searchEvents = pageSession.get('searchEvents');
    let query = {};
    query = queryGeoFilter(query);
    query.endDate = { $lte: inputDate };
    if (searchEvents) {
      query = searchQuery(query, searchEvents);
    }
    return Events.find(query).count();
  },
  sortEvents () {
    return pageSession.get('sortEvents');
  },
  searchEvents () {
    return pageSession.get('searchEvents');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listEvents.events({
  'click .triEvents'(event) {
    event.preventDefault();
    pageSession.set('sortEvents', event.target.value);
    // console.log("sortEvents",  event.target.value);
  },
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchEvents', event.currentTarget.value);
    } else {
      pageSession.set('searchEvents', null);
    }
  },
});

Template.eventsAdd.onCreated(function () {
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
    pageSession.set('organizerType', Router.current().params.scope);
    pageSession.set('organizerId', Router.current().params._id);
  });

  this.autorun(function() {
    const handleList = listsSubs.subscribe('lists', 'eventTypes');
    if (handleList.ready()) {
      template.ready.set(handleList.ready());
    }
  });
});

Template.eventsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('organizerId', null);
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
    const handleList = listsSubs.subscribe('lists', 'eventTypes');
    const handle = Meteor.subscribe('scopeDetail', 'events', Router.current().params._id);
    if (handleList.ready() && handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.eventsBlockEdit.onCreated(function () {
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
    const handleList = listsSubs.subscribe('lists', 'eventTypes');
    const handle = Meteor.subscribe('scopeDetail', 'events', Router.current().params._id);
    if (handleList.ready() && handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});


Template.eventsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.eventsEdit.helpers({
  event () {
    const event = Events.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const eventEdit = {};
    eventEdit._id = event._id._str;
    eventEdit.name = event.name;
    eventEdit.type = event.type;
    eventEdit.shortDescription = event.shortDescription;
    eventEdit.description = event.description;
    eventEdit.startDate = event.startDate;
    eventEdit.endDate = event.endDate;
    if (event && event.preferences) {
      eventEdit.preferences = {};
      if (event.preferences.isOpenData === 'true') {
        eventEdit.preferences.isOpenData = true;
      } else {
        eventEdit.preferences.isOpenData = false;
      }
      if (event.preferences.isOpenEdition === 'true') {
        eventEdit.preferences.isOpenEdition = true;
      } else {
        eventEdit.preferences.isOpenEdition = false;
      }
    }
    eventEdit.allDay = event.allDay;
    eventEdit.country = event.address.addressCountry;
    eventEdit.postalCode = event.address.postalCode;
    eventEdit.city = event.address.codeInsee;
    eventEdit.cityName = event.address.addressLocality;
    if (event && event.address && event.address.streetAddress) {
      eventEdit.streetAddress = event.address.streetAddress;
    }
    if (event && event.address && event.address.regionName) {
      eventEdit.regionName = event.address.regionName;
    }
    if (event && event.address && event.address.depName) {
      eventEdit.depName = event.address.depName;
    }
    if (event && event.address && event.address.localityId) {
      eventEdit.localityId = event.address.localityId;
    }
    eventEdit.geoPosLatitude = event.geo.latitude;
    eventEdit.geoPosLongitude = event.geo.longitude;
    return eventEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.eventsBlockEdit.helpers({
  event () {
    const event = Events.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const eventEdit = {};
    eventEdit._id = event._id._str;
    if (Router.current().params.block === 'descriptions') {
      eventEdit.description = event.description;
      eventEdit.shortDescription = event.shortDescription;
    } else if (Router.current().params.block === 'info') {
      eventEdit.name = event.name;
      eventEdit.type = event.type;
      if (event.tags) {
        eventEdit.tags = event.tags;
      }
      // eventEdit.email = event.email;
      eventEdit.url = event.url;
      /* if(event.telephone){
        if(event.telephone.fixe){
          eventEdit.fixe = event.telephone.fixe.join();
        }
        if(event.telephone.mobile){
          eventEdit.mobile = event.telephone.mobile.join();
        }
        if(event.telephone.fax){
          eventEdit.fax = event.telephone.fax.join();
        }
      } */
    } else if (Router.current().params.block === 'network') {
      if (event.socialNetwork) {
        if (event.socialNetwork.instagram) {
          eventEdit.instagram = event.socialNetwork.instagram;
        }
        if (event.socialNetwork.skype) {
          eventEdit.skype = event.socialNetwork.skype;
        }
        if (event.socialNetwork.googleplus) {
          eventEdit.gpplus = event.socialNetwork.googleplus;
        }
        if (event.socialNetwork.github) {
          eventEdit.github = event.socialNetwork.github;
        }
        if (event.socialNetwork.twitter) {
          eventEdit.twitter = event.socialNetwork.twitter;
        }
        if (event.socialNetwork.facebook) {
          eventEdit.facebook = event.socialNetwork.facebook;
        }
      }
    } else if (Router.current().params.block === 'when') {
      eventEdit.allDay = event.allDay;
      eventEdit.startDate = event.startDate;
      eventEdit.endDate = event.endDate;
    } else if (Router.current().params.block === 'locality') {
      if (event && event.address) {
        eventEdit.country = event.address.addressCountry;
        eventEdit.postalCode = event.address.postalCode;
        eventEdit.city = event.address.codeInsee;
        eventEdit.cityName = event.address.addressLocality;
        if (event && event.address && event.address.streetAddress) {
          eventEdit.streetAddress = event.address.streetAddress;
        }
        if (event && event.address && event.address.regionName) {
          eventEdit.regionName = event.address.regionName;
        }
        if (event && event.address && event.address.depName) {
          eventEdit.depName = event.address.depName;
        }
        if (event && event.address && event.address.localityId) {
          eventEdit.localityId = event.address.localityId;
        }
        eventEdit.geoPosLatitude = event.geo.latitude;
        eventEdit.geoPosLongitude = event.geo.longitude;
      }
    } else if (Router.current().params.block === 'preferences') {
      if (event && event.preferences) {
        eventEdit.preferences = {};
        if (event.preferences.isOpenData === true) {
          eventEdit.preferences.isOpenData = true;
        } else {
          eventEdit.preferences.isOpenData = false;
        }
        if (event.preferences.isOpenEdition === true) {
          eventEdit.preferences.isOpenEdition = true;
        } else {
          eventEdit.preferences.isOpenEdition = false;
        }
      }
    }
    return eventEdit;
  },
  blockSchema() {
    return BlockEventsRest[Router.current().params.block];
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

Template.eventsFields.inheritsHelpersFrom('organizationsFields');
Template.eventsFields.inheritsEventsFrom('organizationsFields');
Template.eventsFields.inheritsHooksFrom('organizationsFields');


Template.eventsFields.helpers({
  organizerType () {
    return pageSession.get('organizerType');
  },
  organizerId () {
    return pageSession.get('organizerId');
  },
  optionsOrganizerId (organizerType) {
    let optionsOrganizer = false;
    if (Meteor.userId() && Citoyens && Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }) && organizerType) {
      // console.log(organizerType);
      if (organizerType === 'organizations') {
        optionsOrganizer = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listOrganizationsCreator();
      } else if (organizerType === 'projects') {
        optionsOrganizer = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listProjectsCreator();
      } else if (organizerType === 'citoyens') {
        optionsOrganizer = Citoyens.find({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { _id: 1, name: 1 } });
      }
      if (optionsOrganizer) {
        // console.log(optionsOrganizer.fetch());
        return optionsOrganizer.map(function (c) {
          return { label: c.name, value: c._id._str };
        });
      }
    }
    return false;
  },
  parentId () {
    return pageSession.get('parentId');
  },
  optionsParentId (organizerType, organizerId) {
    let parent = false;
    if (Meteor.userId() && organizerType && organizerId) {
      if (organizerType === 'organizations') {
        if (Organizations && Organizations.findOne({ _id: new Mongo.ObjectID(organizerId) })) {
          parent = Organizations.findOne({ _id: new Mongo.ObjectID(organizerId) });
        }
      } else if (organizerType === 'projects') {
        if (Projects && Projects.findOne({ _id: new Mongo.ObjectID(organizerId) })) {
          parent = Projects.findOne({ _id: new Mongo.ObjectID(organizerId) });
        }
      } else if (organizerType === 'citoyens') {
        if (Citoyens && Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { name: 1, _id: 1 } })) {
          parent = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { name: 1, _id: 1 } });
        }
      }
      if (parent) {
        const optionsParentId = parent.listEventsCreator();
        if (optionsParentId) {
          // console.log(optionsParentId.fetch());
          // console.log(organizerType);
          // const arrayParent =  optionsParentId.fetch();
          if (optionsParentId.count() > 0) {
            const arrayParent = optionsParentId.map(c => ({ label: c.name, value: c._id._str }));
            return arrayParent;
          }
          return false;
        }
      }
    }
    return false;
  },
  dataReadyOrganizer() {
    return Template.instance().readyOrganizer.get();
  },
  dataReadyParent() {
    return Template.instance().readyParent.get();
  },
});


Template.eventsFields.onCreated(function () {
  const self = this;
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.readyOrganizer = new ReactiveVar();
  template.readyParent = new ReactiveVar();

  self.autorun(function(c) {
    if (Router.current().params._id && Router.current().params.scope) {
      pageSession.set('scopeId', Router.current().params._id);
      pageSession.set('scope', Router.current().params.scope);
      pageSession.set('organizerType', Router.current().params.scope);
      pageSession.set('organizerId', Router.current().params._id);
      c.stop();
    }
  });
});

Template.eventsFields.onRendered(function() {
  const self = this;

  self.autorun(function() {
    const organizerType = pageSession.get('organizerType');
    // console.log(`autorun ${organizerType}`);
    if (organizerType && Meteor.userId()) {
      if (organizerType === 'organizations') {
        const handleOrganizer = self.subscribe('directoryListOrganizations', 'citoyens', Meteor.userId());
        self.readyOrganizer.set(handleOrganizer.ready());
      } else if (organizerType === 'projects') {
        const handleOrganizer = self.subscribe('directoryListProjects', 'citoyens', Meteor.userId());
        self.readyOrganizer.set(handleOrganizer.ready());
      } else if (organizerType === 'citoyens') {
        const handleOrganizer = self.subscribe('citoyen');
        self.readyOrganizer.set(handleOrganizer.ready());
      }
    }
  });

  self.autorun(function() {
    const organizerType = pageSession.get('organizerType');
    const organizerId = pageSession.get('organizerId');
    // console.log(`autorun ${organizerType} ${organizerId}`);
    if (organizerType && organizerId) {
      const handleParent = self.subscribe('directoryListEvents', organizerType, organizerId);
      self.readyParent.set(handleParent.ready());
    }
  });
});

Template.eventsFields.events({
  'change select[name="organizerType"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('organizerType', instance.$(event.currentTarget).val());
    pageSession.set('organizerId', false);
  },
  'change select[name="organizerId"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('organizerId', instance.$(event.currentTarget).val());
  },
});

AutoForm.addHooks(['addEvent', 'editEvent'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'events' }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'events' }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      // console.log(doc);
      doc.organizerType = pageSession.get('organizerType');
      doc.organizerId = pageSession.get('organizerId');
      doc = matchTags(doc, pageSession.get('tags'));
      // console.log(doc.tags);
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.organizerType = pageSession.get('organizerType');
      modifier.$set.organizerId = pageSession.get('organizerId');
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

AutoForm.addHooks(['editBlockEvent'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('block') !== 'preferences') {
          Router.go('detailList', { _id: pageSession.get('scopeId'), scope: 'events' }, { replaceState: true });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const scope = 'events';
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
