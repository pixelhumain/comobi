import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Citoyens, BlockCitoyensRest } from '../../api/citoyens.js';

// submanager
import { listCitoyensSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';


Template.listCitoyens.onCreated(function () {
  pageSession.set('sortCitoyens', null);
  pageSession.set('searchCitoyens', null);
  scopeSubscribe(this, listCitoyensSubs, 'geo.scope', 'citoyens');
});


Template.listCitoyens.helpers({
  citoyens () {
    const searchCitoyens = pageSession.get('searchCitoyens');
    let query = {};
    query = queryGeoFilter(query);
    if (searchCitoyens) {
      query = searchQuery(query, searchCitoyens);
    }
    query._id = { $ne: new Mongo.ObjectID(Meteor.userId()) };
    return Citoyens.find(query);
  },
  countCitoyens () {
    const searchCitoyens = pageSession.get('searchCitoyens');
    let query = {};
    query = queryGeoFilter(query);
    if (searchCitoyens) {
      query = searchQuery(query, searchCitoyens);
    }
    query._id = { $ne: new Mongo.ObjectID(Meteor.userId()) };
    return Citoyens.find(query).count();
  },
  searchCitoyens () {
    return pageSession.get('searchCitoyens');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listCitoyens.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchCitoyens', event.currentTarget.value);
    } else {
      pageSession.set('searchCitoyens', null);
    }
  },
});


Template.citoyensEdit.onCreated(function () {
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
    const handle = Meteor.subscribe('scopeDetail', 'citoyens', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.citoyensEdit.helpers({
  citoyen() {
    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const citoyenEdit = {};
    citoyenEdit._id = citoyen._id._str;
    citoyenEdit.name = citoyen.name;
    citoyenEdit.type = citoyen.type;
    citoyenEdit.email = citoyen.email;
    citoyenEdit.url = citoyen.url;
    citoyenEdit.role = citoyen.role;
    if (citoyen.tags) {
      citoyenEdit.tags = citoyen.tags;
    }
    citoyenEdit.description = citoyen.description;
    citoyenEdit.shortDescription = citoyen.shortDescription;
    if (citoyen.telephone) {
      if (citoyen.telephone.fixe) {
        citoyenEdit.fixe = citoyen.telephone.fixe.join();
      }
      if (citoyen.telephone.mobile) {
        citoyenEdit.mobile = citoyen.telephone.mobile.join();
      }
      if (citoyen.telephone.fax) {
        citoyenEdit.fax = citoyen.telephone.fax.join();
      }
    }
    citoyenEdit.birthDate = citoyen.birthDate;
    if (citoyen.socialNetwork) {
      if (citoyen.socialNetwork.telegram) {
        citoyenEdit.telegramAccount = citoyen.socialNetwork.telegram;
      }
      if (citoyen.socialNetwork.skype) {
        citoyenEdit.skypeAccount = citoyen.socialNetwork.skype;
      }
      if (citoyen.socialNetwork.googleplus) {
        citoyenEdit.gpplusAccount = citoyen.socialNetwork.googleplus;
      }
      if (citoyen.socialNetwork.github) {
        citoyenEdit.githubAccount = citoyen.socialNetwork.github;
      }
      if (citoyen.socialNetwork.twitter) {
        citoyenEdit.twitterAccount = citoyen.socialNetwork.twitter;
      }
      if (citoyen.socialNetwork.facebook) {
        citoyenEdit.facebookAccount = citoyen.socialNetwork.facebook;
      }
    }

    if (citoyen && citoyen.preferences) {
      citoyenEdit.preferences = {};
      if (citoyen.preferences.isOpenData === true) {
        citoyenEdit.preferences.isOpenData = true;
      } else {
        citoyenEdit.preferences.isOpenData = false;
      }
    }
    citoyenEdit.country = citoyen.address.addressCountry;
    citoyenEdit.postalCode = citoyen.address.postalCode;
    citoyenEdit.city = citoyen.address.codeInsee;
    citoyenEdit.cityName = citoyen.address.addressLocality;
    if (citoyen && citoyen.address && citoyen.address.streetAddress) {
      citoyenEdit.streetAddress = citoyen.address.streetAddress;
    }
    if (citoyen && citoyen.address && citoyen.address.regionName) {
      citoyenEdit.regionName = citoyen.address.regionName;
    }
    if (citoyen && citoyen.address && citoyen.address.depName) {
      citoyenEdit.depName = citoyen.address.depName;
    }
    citoyenEdit.geoPosLatitude = citoyen.geo.latitude;
    citoyenEdit.geoPosLongitude = citoyen.geo.longitude;
    return citoyenEdit;
  },
  error() {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});


Template.citoyensBlockEdit.onCreated(function () {
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
    const handle = Meteor.subscribe('scopeDetail', 'citoyens', Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.citoyensBlockEdit.helpers({
  citoyen() {
    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const citoyenEdit = {};
    citoyenEdit._id = citoyen._id._str;
    if (Router.current().params.block === 'descriptions') {
      if (citoyen.description) {
        citoyenEdit.description = citoyen.description;
      }
      if (citoyen.shortDescription) {
        citoyenEdit.shortDescription = citoyen.shortDescription;
      }
    } else if (Router.current().params.block === 'info') {
      citoyenEdit.name = citoyen.name;
      citoyenEdit.username = citoyen.username;
      if (citoyen.tags) {
        citoyenEdit.tags = citoyen.tags;
      }
      citoyenEdit.email = citoyen.email;
      citoyenEdit.url = citoyen.url;
      if (citoyen.telephone) {
        if (citoyen.telephone.fixe) {
          citoyenEdit.fixe = citoyen.telephone.fixe.join();
        }
        if (citoyen.telephone.mobile) {
          citoyenEdit.mobile = citoyen.telephone.mobile.join();
        }
        if (citoyen.telephone.fax) {
          citoyenEdit.fax = citoyen.telephone.fax.join();
        }
      }
      citoyenEdit.birthDate = citoyen.birthDate;
    } else if (Router.current().params.block === 'network') {
      if (citoyen.socialNetwork) {
        if (citoyen.socialNetwork.telegram) {
          citoyenEdit.telegram = citoyen.socialNetwork.telegram;
        }
        if (citoyen.socialNetwork.skype) {
          citoyenEdit.skype = citoyen.socialNetwork.skype;
        }
        if (citoyen.socialNetwork.googleplus) {
          citoyenEdit.gpplus = citoyen.socialNetwork.googleplus;
        }
        if (citoyen.socialNetwork.github) {
          citoyenEdit.github = citoyen.socialNetwork.github;
        }
        if (citoyen.socialNetwork.twitter) {
          citoyenEdit.twitter = citoyen.socialNetwork.twitter;
        }
        if (citoyen.socialNetwork.facebook) {
          citoyenEdit.facebook = citoyen.socialNetwork.facebook;
        }
      }
    } else if (Router.current().params.block === 'locality') {
      citoyenEdit.country = citoyen.address.addressCountry;
      citoyenEdit.postalCode = citoyen.address.postalCode;
      citoyenEdit.city = citoyen.address.codeInsee;
      citoyenEdit.cityName = citoyen.address.addressLocality;
      if (citoyen && citoyen.address && citoyen.address.streetAddress) {
        citoyenEdit.streetAddress = citoyen.address.streetAddress;
      }
      if (citoyen && citoyen.address && citoyen.address.regionName) {
        citoyenEdit.regionName = citoyen.address.regionName;
      }
      if (citoyen && citoyen.address && citoyen.address.depName) {
        citoyenEdit.depName = citoyen.address.depName;
      }
      citoyenEdit.geoPosLatitude = citoyen.geo.latitude;
      citoyenEdit.geoPosLongitude = citoyen.geo.longitude;
    } else if (Router.current().params.block === 'preferences') {
      if (citoyen && citoyen.preferences) {
        citoyenEdit.preferences = {};
        const fieldsArray = ['email', 'locality', 'phone', 'directory', 'birthDate'];
        if (citoyen && citoyen.preferences && citoyen.preferences.publicFields) {
          /* _.each(fieldsArray, (field) => {
            if (citoyen.isPublicFields(field)) {
              citoyenEdit.preferences[field] = 'public';
            }
          }); */
          fieldsArray.forEach((field) => {
            if (citoyen.isPublicFields(field)) {
              citoyenEdit.preferences[field] = 'public';
            }
          });
        }
        if (citoyen && citoyen.preferences && citoyen.preferences.privateFields) {
          /* _.each(fieldsArray, (field) => {
            if (citoyen.isPrivateFields(field)) {
              citoyenEdit.preferences[field] = 'private';
            }
          }); */
          fieldsArray.forEach((field) => {
            if (citoyen.isPrivateFields(field)) {
              citoyenEdit.preferences[field] = 'private';
            }
          });
        }
        /* _.each(fieldsArray, (field) => {
          if (!citoyen.isPrivateFields(field) && !citoyen.isPublicFields(field)) {
            citoyenEdit.preferences[field] = 'hide';
          }
        }); */
        fieldsArray.forEach((field) => {
          if (!citoyen.isPrivateFields(field) && !citoyen.isPublicFields(field)) {
            citoyenEdit.preferences[field] = 'hide';
          }
        });
        if (citoyen.preferences.isOpenData === true) {
          citoyenEdit.preferences.isOpenData = true;
        } else {
          citoyenEdit.preferences.isOpenData = false;
        }
      }
    }
    return citoyenEdit;
  },
  blockSchema() {
    return BlockCitoyensRest[Router.current().params.block];
  },
  block() {
    return Router.current().params.block;
  },
  error() {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.citoyensFields.inheritsHelpersFrom('organizationsFields');
Template.citoyensFields.inheritsEventsFrom('organizationsFields');
Template.citoyensFields.inheritsHooksFrom('organizationsFields');

AutoForm.addHooks(['editCitoyen'], {
  after: {
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'citoyens' });
      }
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

AutoForm.addHooks(['editBlockCitoyen'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('block') !== 'preferences') {
          Router.go('detailList', { _id: pageSession.get('scopeId'), scope: 'citoyens' });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const scope = 'citoyens';
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
