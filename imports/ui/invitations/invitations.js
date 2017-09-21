import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { IonPopup } from 'meteor/meteoric:ionic';

import './invitations.html';

import '../components/directory/list.js';
import '../components/news/button-card.js';

// submanager
import { invitationsSubs } from '../../api/client/subsmanager.js';

import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

import { nameToCollection } from '../../api/helpers.js';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageSearchInvitations');

Template.Page_invitations.onCreated(function() {
  this.ready = new ReactiveVar();
  pageSession.set('searchGlobal', null);
  pageSession.set('filter', null);
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    const handleInvitations = invitationsSubs.subscribe('directoryListInvitations', 'citoyens', Meteor.userId());
    if (handle.ready() && handleInvitations.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});


Template.Page_invitations.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
    // return undefined;
  },
  citoyen () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) });
  },
  filter () {
    return pageSession.get('filter');
  },
  scopeId () {
    return pageSession.get('scopeId');
  },
  scopeVar () {
    return pageSession.get('scope');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.Page_invitations.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 2) {
      pageSession.set('filter', event.currentTarget.value);
    } else if (event.currentTarget.value.length === 0) {
      pageSession.set('filter', null);
      pageSession.set('searchGlobal', null);
    }
  }, 500),
});

Template.searchGlobalInvitations.onRendered(function () {
  this.autorun(function() {
    if (pageSession.get('filter')) {
      const query = pageSession.get('filter');
      const querySearch = {};
      querySearch.search = query;
      // querySearch.searchMode = 'personOnly';
      querySearch.elementId = pageSession.get('scopeId');
      Meteor.call('searchMemberautocomplete', querySearch, function(error, result) {
        let arrayCitoyens = [];
        let arrayOrganizations = [];
        if (result && result.citoyens) {
          arrayCitoyens = _.map(result.citoyens, (arraySearch, key) => ({
            _id: key,
            name: arraySearch.name,
            profilThumbImageUrl: arraySearch.profilThumbImageUrl,
            type: arraySearch.type,
            typeSig: 'citoyens',
            address: arraySearch.address,
          }));
          if (result && result.organizations) {
            arrayOrganizations = _.map(result.organizations, (arraySearch, key) => ({
              _id: key,
              name: arraySearch.name,
              profilThumbImageUrl: arraySearch.profilThumbImageUrl,
              type: arraySearch.type,
              typeSig: 'organizations',
              address: arraySearch.address,
            }));
          }
          // console.log(array);
          if (result) {
            pageSession.set('searchGlobal', [...arrayCitoyens, ...arrayOrganizations]);
          }
        }
      });
    }
  });
});

Template.searchGlobalInvitations.helpers({
  searchGlobal () {
    return pageSession.get('searchGlobal');
  },
  countSearchGlobal () {
    return pageSession.get('searchGlobal') && pageSession.get('searchGlobal').length;
  },
  icone (icone) {
    if (icone === 'citoyens') {
      return { class: 'icon fa fa-user yellow' };
    } else if (icone === 'projects') {
      return { class: 'icon fa fa-lightbulb-o purple' };
    } else if (icone === 'organizations') {
      return { class: 'icon fa fa-users green' };
    } else if (icone === 'city') {
      return { class: 'icon fa fa-university red' };
    }
    return undefined;
  },
  urlType() {
    if (this.typeSig === 'citoyens') {
      return { class: 'icon fa fa-user yellow' };
    } else if (this.typeSig === 'projects') {
      return { class: 'icon fa fa-lightbulb-o purple' };
    } else if (this.typeSig === 'organizations') {
      return { class: 'icon fa fa-users green' };
    } else if (this.typeSig === 'city') {
      return { class: 'icon fa fa-university red' };
    }
    return undefined;
  },
});

Template.formInvitations.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('invitedUserEmail', null);
});

Template.formInvitations.onRendered(function () {
  pageSession.set('error', false);
  pageSession.set('invitedUserEmail', null);
});

Template.formInvitations.helpers({
  error () {
    return pageSession.get('error');
  },
});

AutoForm.addHooks(['formInvitations'], {
  before: {
    method(doc) {
      pageSession.set('error', null);
      pageSession.set('invitedUserEmail', doc.childEmail);
      const scopeId = pageSession.get('scopeId');
      const scope = pageSession.get('scope');
      doc.parentId = scopeId;
      doc.parentType = scope;
      return doc;
    },
  },
  after: {
    method(error) {
      if (!error) {
        pageSession.set('error', null);
      }
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        if (error.reason === "Problème à l'insertion du nouvel utilisateur : une personne avec cet mail existe déjà sur la plateforme") {
          pageSession.set('error', error.reason.replace(':', ' '));
          IonPopup.alert({ template: TAPi18n.__(error.reason.replace(':', ' ')) });
          pageSession.set('filter', pageSession.get('invitedUserEmail'));
          /* Meteor.call('saveattendeesEvent', pageSession.get('scopeId'), pageSession.get('invitedUserEmail'), function(errorSave) {
            if (errorSave) {
              pageSession.set('error', error.reason.replace(':', ' '));
            } else {

            }
          }); */
        }
      } else {
        pageSession.set('error', error.reason.replace(':', ' '));
        //IonPopup.alert({ template: TAPi18n.__(error.reason.replace(':', ' ')) });
      }
    }
  },
});
