import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { $ } from 'meteor/jquery';

import { Proposals } from '../../../api/proposals.js';
import { Events } from '../../../api/events.js';
import { Organizations } from '../../../api/organizations.js';
import { Projects } from '../../../api/projects.js';

import { nameToCollection } from '../../../api/helpers.js';

// submanager
import { newsListSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';

import './proposals.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;

Template.detailProposals.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
  });

  this.autorun(function() {
    const handle = newsListSubs.subscribe('detailProposals', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.proposalId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.detailProposals.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.votesAmendements.events({
  'click .savevote-js' (event) {
    event.preventDefault();
    const voteValue = $(event.currentTarget).data('vote');
    Meteor.call('saveVote', { parentType: 'amendement', parentId: pageSession.get('proposalId'), voteValue, idAmdt: this.amendementId }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
});

Template.votesProposals.events({
  'click .savevote-js' (event) {
    event.preventDefault();
    const voteValue = $(event.currentTarget).data('vote');
    Meteor.call('saveVote', { parentType: 'proposal', parentId: pageSession.get('proposalId'), voteValue }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
});


Template.buttonsProposals.events({
  'click .action-proposal-js' (event) {
    event.preventDefault();
    const action = $(event.currentTarget).data('action');
    Meteor.call('actionsType', { parentType: pageSession.get('scope'), parentId: pageSession.get('scopeId'), type: 'proposals', id: pageSession.get('proposalId'), name:'status', value: action }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
});

Template.itemAmendementsProposals.events({
  'click .action-amendement-js' (event) {
    const self = this;
    event.preventDefault();
    IonPopup.confirm({ title: TAPi18n.__('Delete this amendment'),
      template: TAPi18n.__('Are you sure you want to delete your amendment'),
      onOk() {
        Meteor.call('deleteAmendement', { numAm: self.amendement.idKey, idProposal: pageSession.get('proposalId') }, (error) => {
          if (error) {
            IonPopup.alert({ template: TAPi18n.__(error.reason) });
          }
        });
      },
      onCancel() {

      },
      cancelText: TAPi18n.__('no'),
      okText: TAPi18n.__('yes'),
    });
  },
});


Template.proposalsAdd.onCreated(function () {
  pageSession.set('error', false);
  pageSession.set('majority', null);
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
  });
});

Template.proposalsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('majority', null);
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('detailProposals', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.proposalId);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.proposalsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.proposalsEdit.helpers({
  proposal () {
    const proposal = Proposals.findOne({ _id: new Mongo.ObjectID(Router.current().params.proposalId) });
    const proposalEdit = {};
    proposalEdit._id = proposal._id._str;
    proposalEdit.title = proposal.title;
    proposalEdit.description = proposal.description;
    proposalEdit.arguments = proposal.arguments;
    // transform type
    proposalEdit.amendementActivated = proposal.amendementActivatedBool();
    proposalEdit.voteAnonymous = proposal.voteAnonymousBool();
    proposalEdit.voteCanChange = proposal.voteCanChangeBool();
    if (proposal.amendementDateEnd) {
      proposalEdit.amendementDateEnd = proposal.momentAmendementDateEnd();
    }
    if (proposal.voteDateEnd) {
      proposalEdit.voteDateEnd = proposal.momentVoteDateEnd();
    }
    // proposalEdit.voteActivated = proposal.voteActivated;
    if (proposal.majority) {
      proposalEdit.majority = parseInt(proposal.majority);
      pageSession.set('majority', proposal.majority);
    }
    proposalEdit.tags = proposal.tags;
    proposalEdit.urls = proposal.urls;
    return proposalEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.proposalsFields.events({
  'change/keyup input[name="majority"]'(event, instance) {
    event.preventDefault();
    // console.log(instance.$(event.currentTarget).val());
    pageSession.set('majority', instance.$(event.currentTarget).val());
  },
});

Template.proposalsFields.helpers({
  majority () {
    return pageSession.get('majority') ? pageSession.get('majority') : '50';
  },
});

AutoForm.addHooks(['addProposal', 'editProposal'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.parentType = pageSession.get('scope');
      doc.parentId = pageSession.get('scopeId');
      doc.idParentRoom = pageSession.get('roomId');
      if (doc.amendementActivated === true) {
        doc.status = 'amendable';
      } else {
        doc.status = 'tovote';
      }
      doc.voteActivated = true;
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('scope');
      modifier.$set.parentId = pageSession.get('scopeId');
      modifier.$set.idParentRoom = pageSession.get('roomId');
      if (modifier.$set.amendementActivated === true) {
        modifier.$set.status = 'amendable';
      } else {
        modifier.$set.status = 'tovote';
      }
      modifier.$set.voteActivated = true;
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

Template.amendementsAdd.onCreated(function () {
  pageSession.set('error', false);
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
  });
});

Template.amendementsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('proposalId', Router.current().params.proposalId);
    pageSession.set('amendementId', Router.current().params.amendementId);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('detailProposals', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.proposalId);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.amendementsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.amendementsEdit.helpers({
  amendement () {
    const query = {};
    query._id = new Mongo.ObjectID(Router.current().params.proposalId);
    query[`amendements.${Router.current().params.amendementId}`] = {$exists: true};
    const options = {};
    options.fields = {};
    options.fields._id = 1;
    options.fields[`amendements.${Router.current().params.amendementId}`] = 1;
    const amendement = Proposals.findOne(query, options);
    const amendementEdit = {};
    amendementEdit._id = amendement._id._str;
    amendementEdit.txtAmdt = amendement.amendements[Router.current().params.amendementId].textAdd
    return amendementEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addAmendement', 'editAmendement'], {
  after: {
    method(error, result) {
      if (!error) {
        Router.go('proposalsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), proposalId: pageSession.get('proposalId') }, { replaceState: true });
      }
    },
    'method-update'(error, result) {
      if (!error) {
        Router.go('proposalsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), proposalId: pageSession.get('proposalId') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.id = pageSession.get('proposalId');
      doc.block = 'amendement';
      doc.typeElement = 'proposals';
      doc.typeAmdt = 'add';
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.id = pageSession.get('proposalId');
      modifier.$set.block = 'amendement';
      modifier.$set.typeElement = 'proposals';
      modifier.$set.typeAmdt = 'add';
      // Todo pas fait coté serveur co2 manque id amendement
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
