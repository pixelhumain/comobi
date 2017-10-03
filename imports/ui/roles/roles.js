import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

// collections
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

import { nameToCollection } from '../../api/helpers.js';

import { pageSession } from '../../api/client/reactive.js';

import './roles.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.rolesEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('childId', Router.current().params.childId);
    pageSession.set('childType', Router.current().params.childType);
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.rolesEdit.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  roles () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      const collectionOne = collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
      const collectionEdit = {};
      let scopeContext;
      if (Router.current().params.scope === 'organizations') {
        scopeContext = 'members';
      } else if (Router.current().params.scope === 'projects') {
        scopeContext = 'contributors';
      } else if (Router.current().params.scope === 'events') {
        scopeContext = 'attendees';
      }
      if (collectionOne && collectionOne.links && collectionOne.links[scopeContext] && collectionOne.links[scopeContext][Router.current().params.childId] && collectionOne.links[scopeContext][Router.current().params.childId].roles) {
        collectionEdit.roles = collectionOne.links[scopeContext][Router.current().params.childId].roles;
      }
      return collectionEdit;
    }
  },
  error () {
    return pageSession.get('error');
  },
  scopeId () {
    return pageSession.get('scopeId');
  },
  childId () {
    return pageSession.get('childId');
  },
  childType () {
    return pageSession.get('childType');
  },
  scopeVarTrad () {
    if (pageSession.get('scope') === 'organizations') {
      return TAPi18n.__('member');
    } else if (pageSession.get('scope') === 'projects') {
      return TAPi18n.__('contributor');
    } else if (pageSession.get('scope') === 'events') {
      return TAPi18n.__('attendee');
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});


AutoForm.addHooks(['editRoles'], {
  after: {
    'method-update'(error) {
      if (!error) {
        if (pageSession.get('scope') === 'events') {
          Router.go('listAttendees', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
        } else {
          Router.go('directory', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
        }
      }
    },
  },
  before: {
    'method-update'(modifier) {
      const contextType = pageSession.get('scope');
      const contextId = pageSession.get('scopeId');
      const childId = pageSession.get('childId');
      const childType = pageSession.get('childType');
      if (!(modifier && modifier.$set)) {
        modifier.$set = {};
        modifier.$set.roles = [];
      }
      if (contextType === 'organizations') {
        modifier.$set.connectType = 'members';
      } else if (contextType === 'projects') {
        modifier.$set.connectType = 'contributors';
      } else if (contextType === 'events') {
        modifier.$set.connectType = 'attendees';
      }
      modifier.$set.contextId = contextId;
      modifier.$set.contextType = contextType;
      modifier.$set.childId = childId;
      modifier.$set.childType = childType;
      return modifier;
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      pageSession.set('error', error.reason.replace(': ', ''));
    }
  },
});
