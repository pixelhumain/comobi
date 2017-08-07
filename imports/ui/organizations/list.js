import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';


// collections
import { Organizations, BlockOrganizationsRest } from '../../api/organizations.js';
import { Cities } from '../../api/cities.js';

// submanager
import { listOrganizationsSubs, listsSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import '../map/map.js';
import '../components/scope/item.js';

import './list.html';

import { pageSession } from '../../api/client/reactive.js';
import position from '../../api/client/position.js';
import { searchQuery, queryGeoFilter, matchTags } from '../../api/helpers.js';

Template.listOrganizations.onCreated(function () {
  pageSession.set('sortOrganizations', null);
  pageSession.set('searchOrganizations', null);
  scopeSubscribe(this, listOrganizationsSubs, 'geo.scope', 'organizations');
});


Template.listOrganizations.helpers({
  organizations () {
    const searchOrganizations = pageSession.get('searchOrganizations');
    let query = {};
    query = queryGeoFilter(query);
    if (searchOrganizations) {
      query = searchQuery(query, searchOrganizations);
    }
    return Organizations.find(query);
  },
  countOrganizations () {
    const searchOrganizations = pageSession.get('searchOrganizations');
    let query = {};
    query = queryGeoFilter(query);
    if (searchOrganizations) {
      query = searchQuery(query, searchOrganizations);
    }
    return Organizations.find(query).count();
  },
  searchOrganizations () {
    return pageSession.get('searchOrganizations');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listOrganizations.events({
  'keyup #search, change #search'(event) {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('searchOrganizations', event.currentTarget.value);
    } else {
      pageSession.set('searchOrganizations', null);
    }
  },
});

Template.organizationsAdd.onCreated(function () {
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
    const handleList = listsSubs.subscribe('lists', 'organisationTypes');
    if (handleList.ready()) {
      template.ready.set(handleList.ready());
    }
  });
});

Template.organizationsEdit.onCreated(function () {
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
    const handleList = listsSubs.subscribe('lists', 'organisationTypes');
    const handle = Meteor.subscribe('scopeDetail', 'organizations', Router.current().params._id);
    if (handleList.ready() && handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.organizationsBlockEdit.onCreated(function () {
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
    const handleList = listsSubs.subscribe('lists', 'organisationTypes');
    const handle = Meteor.subscribe('scopeDetail', 'organizations', Router.current().params._id);
    if (handleList.ready() && handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.organizationsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.organizationsEdit.helpers({
  organization () {
    const organization = Organizations.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const organizationEdit = {};
    organizationEdit._id = organization._id._str;
    organizationEdit.name = organization.name;
    organizationEdit.type = organization.type;
    organizationEdit.email = organization.email;
    organizationEdit.url = organization.url;
    organizationEdit.role = organization.role;
    organizationEdit.tags = organization.tags;
    organizationEdit.description = organization.description;
    organizationEdit.shortDescription = organization.shortDescription;
    if (organization && organization.preferences) {
      organizationEdit.preferences = {};
      if (organization.preferences.isOpenData === 'true') {
        organizationEdit.preferences.isOpenData = true;
      } else {
        organizationEdit.preferences.isOpenData = false;
      }
      if (organization.preferences.isOpenEdition === 'true') {
        organizationEdit.preferences.isOpenEdition = true;
      } else {
        organizationEdit.preferences.isOpenEdition = false;
      }
    }
    organizationEdit.country = organization.address.addressCountry;
    organizationEdit.postalCode = organization.address.postalCode;
    organizationEdit.city = organization.address.codeInsee;
    organizationEdit.cityName = organization.address.addressLocality;
    if (organization && organization.address && organization.address.streetAddress) {
      organizationEdit.streetAddress = organization.address.streetAddress;
    }
    if (organization && organization.address && organization.address.regionName) {
      organizationEdit.regionName = organization.address.regionName;
    }
    if (organization && organization.address && organization.address.depName) {
      organizationEdit.depName = organization.address.depName;
    }
    organizationEdit.geoPosLatitude = organization.geo.latitude;
    organizationEdit.geoPosLongitude = organization.geo.longitude;
    return organizationEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.organizationsBlockEdit.helpers({
  organization () {
    const organization = Organizations.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    const organizationEdit = {};
    organizationEdit._id = organization._id._str;
    if (Router.current().params.block === 'descriptions') {
      organizationEdit.description = organization.description;
      organizationEdit.shortDescription = organization.shortDescription;
    } else if (Router.current().params.block === 'info') {
      organizationEdit.name = organization.name;
      organizationEdit.type = organization.type;
      organizationEdit.role = organization.role;
      if (organization.tags) {
        organizationEdit.tags = organization.tags;
      }
      organizationEdit.email = organization.email;
      organizationEdit.url = organization.url;
      if (organization.telephone) {
        if (organization.telephone.fixe) {
          organizationEdit.fixe = organization.telephone.fixe.join();
        }
        if (organization.telephone.mobile) {
          organizationEdit.mobile = organization.telephone.mobile.join();
        }
        if (organization.telephone.fax) {
          organizationEdit.fax = organization.telephone.fax.join();
        }
      }
    } else if (Router.current().params.block === 'network') {
      if (organization.socialNetwork) {
        if (organization.socialNetwork.instagram) {
          organizationEdit.instagram = organization.socialNetwork.instagram;
        }
        if (organization.socialNetwork.skype) {
          organizationEdit.skype = organization.socialNetwork.skype;
        }
        if (organization.socialNetwork.googleplus) {
          organizationEdit.gpplus = organization.socialNetwork.googleplus;
        }
        if (organization.socialNetwork.github) {
          organizationEdit.github = organization.socialNetwork.github;
        }
        if (organization.socialNetwork.twitter) {
          organizationEdit.twitter = organization.socialNetwork.twitter;
        }
        if (organization.socialNetwork.facebook) {
          organizationEdit.facebook = organization.socialNetwork.facebook;
        }
      }
    } else if (Router.current().params.block === 'locality') {
      if (organization && organization.address) {
        organizationEdit.country = organization.address.addressCountry;
        organizationEdit.postalCode = organization.address.postalCode;
        organizationEdit.city = organization.address.codeInsee;
        organizationEdit.cityName = organization.address.addressLocality;
        if (organization && organization.address && organization.address.streetAddress) {
          organizationEdit.streetAddress = organization.address.streetAddress;
        }
        if (organization && organization.address && organization.address.regionName) {
          organizationEdit.regionName = organization.address.regionName;
        }
        if (organization && organization.address && organization.address.depName) {
          organizationEdit.depName = organization.address.depName;
        }
        organizationEdit.geoPosLatitude = organization.geo.latitude;
        organizationEdit.geoPosLongitude = organization.geo.longitude;
      }
    } else if (Router.current().params.block === 'preferences') {
      if (organization && organization.preferences) {
        organizationEdit.preferences = {};
        if (organization.preferences.isOpenData === true) {
          organizationEdit.preferences.isOpenData = true;
        } else {
          organizationEdit.preferences.isOpenData = false;
        }
        if (organization.preferences.isOpenEdition === true) {
          organizationEdit.preferences.isOpenEdition = true;
        } else {
          organizationEdit.preferences.isOpenEdition = false;
        }
      }
    }
    return organizationEdit;
  },
  blockSchema() {
    return BlockOrganizationsRest[Router.current().params.block];
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

Template.organizationsFields.helpers({
  optionsInsee () {
    let postalCode = '';
    let country = '';
    postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    country = pageSession.get('country') || AutoForm.getFieldValue('country');
    if (postalCode && country) {
      const insee = Cities.find({ 'postalCodes.postalCode': postalCode, country });
      // console.log(insee.fetch());
      if (insee) {
        return insee.map(function (c) {
          return { label: c.alternateName, value: c.insee };
        });
      }
    }
    return false;
  },
  latlng () {
    const city = pageSession.get('city') || AutoForm.getFieldValue('city');
    const latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    const longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    return city && latitude && longitude;
  },
  longitude () {
    return pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
  },
  latitude () {
    return pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
  },
  country () {
    return pageSession.get('country') || AutoForm.getFieldValue('country');
  },
  postalCode () {
    return pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
  },
  city () {
    return pageSession.get('city') || AutoForm.getFieldValue('city');
  },
  cityName () {
    return pageSession.get('cityName') || AutoForm.getFieldValue('cityName');
  },
  regionName () {
    return pageSession.get('regionName') || AutoForm.getFieldValue('regionName');
  },
  depName () {
    return pageSession.get('depName') || AutoForm.getFieldValue('depName');
  },
});


Template.organizationsFields.onRendered(function() {
  const self = this;
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('cityName', null);
  pageSession.set('regionName', null);
  pageSession.set('depName', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);

  const geolocate = position.getGeolocate();
  // console.log('geo');
  if (geolocate && Router.current().route.getName() !== 'organizationsEdit' && Router.current().route.getName() !== 'organizationsBlockEdit'
  && Router.current().route.getName() !== 'citoyensEdit' && Router.current().route.getName() !== 'citoyensBlockEdit'
  && Router.current().route.getName() !== 'projectsEdit' && Router.current().route.getName() !== 'projectsBlockEdit'
  && Router.current().route.getName() !== 'eventsEdit' && Router.current().route.getName() !== 'eventsBlockEdit'
  && Router.current().route.getName() !== 'poiEdit' && Router.current().route.getName() !== 'poiBlockEdit'
  && Router.current().route.getName() !== 'classifiedEdit') {
    IonPopup.confirm({ template: TAPi18n.__('Use your current location'),
      onOk() {
        const latlngObj = position.getLatlngObject();
        if (latlngObj) {
          Meteor.call('getcitiesbylatlng', latlngObj, function(error, result) {
            if (result) {
            // console.log(result);
              pageSession.set('postalCode', result.postalCodes[0].postalCode);
              pageSession.set('country', result.country);
              pageSession.set('city', result.insee);
              pageSession.set('cityName', result.postalCodes[0].name);
              pageSession.set('regionName', result.regionName);
              pageSession.set('depName', result.depName);
              pageSession.set('geoPosLatitude', latlngObj.latitude);
              pageSession.set('geoPosLongitude', latlngObj.longitude);
            }
          });
        }
      },
      cancelText: TAPi18n.__('no'),
      okText: TAPi18n.__('yes'),
    });
  }

  self.autorun(function() {
    const postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    const country = pageSession.get('country') || AutoForm.getFieldValue('country');
    if (!!postalCode && !!country) {
      if (postalCode.length > 4) {
        self.subscribe('cities', postalCode, country);
      }
    }
  });

  // #tags
  pageSession.set('queryTag', false);
  pageSession.set('tags', false);
  self.$('textarea').atwho({
    at: '#',
  }).on('matched.atwho', function(event, flag, query) {
    // console.log(event, `matched ${flag} and the result is ${query}`);
    if (flag === '#' && query) {
      // console.log(pageSession.get('queryTag'));
      if (pageSession.get('queryTag') !== query) {
        pageSession.set('queryTag', query);
        Meteor.call('searchTagautocomplete', query, function(error, result) {
          if (!error) {
            // console.log(result);
            self.$('textarea').atwho('load', '#', result).atwho('run');
          }
        });
      }
    }
  }).on('inserted.atwho', function(event, $li) {
    // console.log(JSON.stringify($li.data('item-data')));
    if ($li.data('item-data')['atwho-at'] === '#') {
      const tag = $li.data('item-data').name;
      if (pageSession.get('tags')) {
        const arrayTags = pageSession.get('tags');
        arrayTags.push(tag);
        pageSession.set('tags', arrayTags);
      } else {
        pageSession.set('tags', [tag]);
      }
    }
  });
});

Template.organizationsFields.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});

Template.organizationsFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]': _.throttle((event, instance) => {
    event.preventDefault();
    pageSession.set('postalCode', instance.$(event.currentTarget).val());
  }, 500),
  'change select[name="country"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('country', instance.$(event.currentTarget).val());
  },
  'change select[name="city"]'(event, instance) {
    event.preventDefault();
    // console.log(tmpl.$(e.currentTarget).val());
    pageSession.set('city', instance.$(event.currentTarget).val());
    const insee = Cities.findOne({ insee: instance.$(event.currentTarget).val() });
    pageSession.set('geoPosLatitude', insee.geo.latitude);
    pageSession.set('geoPosLongitude', insee.geo.longitude);
    pageSession.set('regionName', insee.regionName);
    pageSession.set('depName', insee.depName);
    pageSession.set('cityName', event.currentTarget.options[event.currentTarget.selectedIndex].text);
    // console.log(insee.geo.latitude);
    // console.log(insee.geo.longitude);
  },
  'change input[name="streetAddress"]': _.throttle((event, instance) => {
    // remplace les espaces par des +
    const transformNominatimUrl = (str) => {
      let res = '';
      for (let i = 0; i < str.length; i += 1) {
        res += (str.charAt(i) === ' ') ? '+' : str.charAt(i);
      }
      return res;
    };

    const addToRequest = (request, dataStr) => {
      let dataStrIn = dataStr;
      if (dataStrIn === '') return request;
      if (request !== '') dataStrIn = ` ${dataStrIn}`;
      return transformNominatimUrl(request + dataStrIn);
    };

    let postalCode = '';
    let country = '';
    let streetAddress = '';
    postalCode = AutoForm.getFieldValue('postalCode');
    country = instance.find('select[name="country"]').options[instance.find('select[name="country"]').selectedIndex].text;
    // console.log(country);
    streetAddress = AutoForm.getFieldValue('streetAddress');

    let request = '';

    request = addToRequest(request, streetAddress);
    request = addToRequest(request, postalCode);
    request = addToRequest(request, country);
    request = transformNominatimUrl(request);

    if (event.currentTarget.value.length > 5) {
      HTTP.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${request}&key=${Meteor.settings.public.googlekey}`, {},
        function(error, response) {
          if (error) {
          // console.log( error );
          } else if (response.data.results.length > 0 && response.data.status !== 'ZERO_RESULTS') {
            pageSession.set('geoPosLatitude', response.data.results[0].geometry.location.lat);
            pageSession.set('geoPosLongitude', response.data.results[0].geometry.location.lng);
            // console.log(response.data.results[0].geometry.location.lat);
            // console.log(response.data.results[0].geometry.location.lng);
          }
        },
      );
    }
  }, 500),
});

AutoForm.addHooks(['addOrganization', 'editOrganization'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'organizations' });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('detailList', { _id: result.data.id, scope: 'organizations' });
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

AutoForm.addHooks(['addOrganization'], {
  before: {
    method(doc) {
      return matchTags(doc, pageSession.get('tags'));
    },
  },
});

AutoForm.addHooks(['editBlockOrganization'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('block') !== 'preferences') {
          Router.go('detailList', { _id: pageSession.get('scopeId'), scope: 'organizations' });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const scope = 'organizations';
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
