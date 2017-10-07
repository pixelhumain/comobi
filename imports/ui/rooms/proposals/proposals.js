import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';

import { Proposals } from '../../../api/proposals.js';

// submanager
import { newsListSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';

import './proposals.html';

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
  proposals () {
    return Proposals.findOne({ _id: new Mongo.ObjectID(Router.current().params.proposalId) });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.votesProposals.events({
  'click .savevoteup-js' (event) {
    event.preventDefault();
    Meteor.call('saveVote', { parentType: 'amendement', parentId: pageSession.get('proposalId'), voteValue: 'up', idAmdt: this.amendementId }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
  'click .savevotedown-js' (event) {
    event.preventDefault();
    Meteor.call('saveVote', { parentType: 'amendement', parentId: pageSession.get('proposalId'), voteValue: 'down', idAmdt: this.amendementId }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
  'click .savevotewhite-js' (event) {
    event.preventDefault();
    Meteor.call('saveVote', { parentType: 'amendement', parentId: pageSession.get('proposalId'), voteValue: 'white', idAmdt: this.amendementId }, (error) => {
      if (error) {
        IonPopup.alert({ template: TAPi18n.__(error.reason) });
      }
    });
  },
});
