import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema, blockBaseSchema } from './schema.js';
import { Citoyens } from './citoyens.js';
import { Comments } from './comments.js';

if (Meteor.isclient) {
  import { Chronos } from './client/chronos.js';
}

export const Proposals = new Mongo.Collection('proposals', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

/* //proposal
idParentRoom:59d64c0240bb4e2e4fdcd10b
title:test proposition
description:test proposition
arguments:test proposition argument
amendementActivated:true
amendementDateEnd:2017-10-28T13:00:00+04:00
voteActivated:true
voteDateEnd:2017-10-21T12:55:00+04:00
majority:50
voteAnonymous:true
voteCanChange:true
tags[]:Agriculture
status:amendable
parentId:598ad7bc40bb4e3f11219447
parentType:organizations
key:proposal
collection:proposals */

export const SchemasProposalsRest = new SimpleSchema([baseSchema.pick(['description', 'tags', 'tags.$']), {
  idParentRoom: {
    type: String,
  },
  title: {
    type: String,
  },
  arguments: {
    type: String,
    optional: true,
  },
  amendementActivated: {
    type: Boolean,
  },
  amendementDateEnd: {
    type: Date,
    optional: true,
    custom () {
      if (this.field('amendementActivated').value === true && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      // amendementDateEnd plus petit que voteDateEnd
      const amendementDateEnd = moment(this.value).toDate();
      const voteDateEnd = moment(this.field('voteDateEnd').value).toDate();
      if (moment(voteDateEnd).isBefore(amendementDateEnd)) {
        return 'maxDateAmendment';
      }
    },
  },
  voteActivated: {
    type: Boolean,
    defaultValue: true,
  },
  voteDateEnd: {
    type: Date,
    custom () {
      // voteDateEnd plus grand que amendementDateEnd
      if (this.field('amendementActivated').value === true && this.field('amendementDateEnd').value) {
        const amendementDateEnd = moment(this.field('amendementDateEnd').value).toDate();
        const voteDateEnd = moment(this.value).toDate();
        if (moment(voteDateEnd).isBefore(amendementDateEnd)) {
          return 'minDateVote';
        }
      }
    },
  },
  majority: {
    type: Number,
    defaultValue: 50,
    min: 50,
    max: 100,
  },
  voteAnonymous: {
    type: Boolean,
    defaultValue: true,
  },
  voteCanChange: {
    type: Boolean,
    defaultValue: true,
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  status: {
    type: String,
    allowedValues: ['done', 'disabled', 'amendable', 'tovote'],
  },
  urls: {
    type: [String],
    optional: true,
  },
}]);

/* block:amendement
typeElement:proposals
id:59d7450d40bb4e926fdcd10b
txtAmdt:proposition amendement
typeAmdt:add */

export const BlockProposalsRest = new SimpleSchema([blockBaseSchema, {
  id: {
    type: String,
  },
  txtAmdt: {
    type: String,
  },
  typeAmdt: {
    type: String,
  },
}]);


Proposals.helpers({
  isVisibleFields (field) {
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'proposals';
  },
  scopeEdit () {
    return 'proposalsEdit';
  },
  listScope () {
    return 'listProposals';
  },
  momentAmendementDateEnd() {
    return moment(this.amendementDateEnd).toDate();
  },
  momentVoteDateEnd() {
    return moment(this.voteDateEnd).toDate();
  },
  formatAmendementDateEnd() {
    return moment(this.amendementDateEnd).format('DD/MM/YYYY HH:mm');
  },
  formatVoteDateEnd() {
    return moment(this.voteDateEnd).format('DD/MM/YYYY HH:mm');
  },
  isEndAmendement () {
    const end = moment(this.amendementDateEnd).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment(end).isBefore(); // True
    }
    return moment(end).isBefore(); // True
  },
  isEndVote () {
    const end = moment(this.voteDateEnd).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment(end).isBefore(); // True
    }
    return moment(end).isBefore(); // True
  },
  isNotEndAmendement () {
    const end = moment(this.amendementDateEnd).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment().isBefore(end); // True
    }
    return moment().isBefore(end); // True
  },
  isNotEndVote () {
    const end = moment(this.voteDateEnd).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment().isBefore(end); // True
    }
    return moment().isBefore(end); // True
  },
  voteActivatedBool () {
    return this.convertBool(this.voteActivated);
  },
  voteCanChangeBool () {
    return this.convertBool(this.voteCanChange);
  },
  voteAnonymousBool () {
    return this.convertBool(this.voteAnonymous);
  },
  amendementActivatedBool () {
    return this.convertBool(this.amendementActivated);
  },
  convertBool(value) {
    return (value === 'true' || value === true);
  },
  creatorProfile () {
    return Citoyens.findOne({
      _id: new Mongo.ObjectID(this.creator),
    }, {
      fields: {
        name: 1,
        profilThumbImageUrl: 1,
      },
    });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  votesResultat () {
    const votes = this.votes ? this.votes : null;
    const majority = this.majority ? parseInt(this.majority) : 50;
    const voteUp = votes && votes.up ? votes.up.length : 0;
    const voteDown = votes && votes.down ? votes.down.length : 0;
    const voteWhite = votes && votes.white ? votes.white.length : 0;
    const voteUncomplet = votes && votes.uncomplet ? votes.uncomplet.length : 0;
    const totalVotes = voteUp + voteDown + voteWhite + voteUncomplet;
    const pourcVoteUp = totalVotes > 0 ? (100 * voteUp) / totalVotes : 0;
    const pourcVoteDown = totalVotes > 0 ? (100 * voteDown) / totalVotes : 0;
    const pourcVoteWhite = totalVotes > 0 ? (100 * voteWhite) / totalVotes : 0;
    const pourcVoteUncomplet = totalVotes > 0 ? (100 * voteUncomplet) / totalVotes : 0;
    const meVoteUp = (votes && votes.up && Meteor.userId() && votes.up.includes(Meteor.userId()));
    const meVoteDown = (votes && votes.down && Meteor.userId() && votes.down.includes(Meteor.userId()));
    const meVoteWhite = (votes && votes.white && Meteor.userId() && votes.white.includes(Meteor.userId()));
    const meVoteUncomplet = (votes && votes.uncomplet && Meteor.userId() && votes.uncomplet.includes(Meteor.userId()));
    const meVote = (meVoteUp || meVoteDown || meVoteWhite || meVoteUncomplet);
    const voteValid = (totalVotes > 0 && pourcVoteUp > majority);
    const voteStart = (totalVotes > 0);
    return {
      voteStart,
      voteValid,
      totalVotes,
      meVote,
      voteUp: { nb: voteUp.toString(), pourc: pourcVoteUp.toString(), meVoteUp },
      voteDown: { nb: voteDown.toString(), pourc: pourcVoteDown.toString(), meVoteDown },
      voteWhite: { nb: voteWhite.toString(), pourc: pourcVoteWhite.toString(), meVoteWhite },
      voteUncomplet: { nb: voteUncomplet.toString(), pourc: pourcVoteUncomplet.toString(), meVoteUncomplet },
    };
  },
  votesAmendements (votes) {
    const voteUp = votes && votes.up ? votes.up.length : 0;
    const voteDown = votes && votes.down ? votes.down.length : 0;
    const voteWhite = votes && votes.white ? votes.white.length : 0;
    const totalVotes = voteUp + voteDown + voteWhite;
    const pourcVoteUp = totalVotes > 0 ? (100 * voteUp) / totalVotes : 0;
    const pourcVoteDown = totalVotes > 0 ? (100 * voteDown) / totalVotes : 0;
    const pourcVoteWhite = totalVotes > 0 ? (100 * voteWhite) / totalVotes : 0;
    const meVoteUp = (votes && votes.up && Meteor.userId() && votes.up.includes(Meteor.userId()));
    const meVoteDown = (votes && votes.down && Meteor.userId() && votes.down.includes(Meteor.userId()));
    const meVoteWhite = (votes && votes.white && Meteor.userId() && votes.white.includes(Meteor.userId()));
    const meVote = (meVoteUp || meVoteDown || meVoteWhite);
    const voteValid = (totalVotes > 0 && pourcVoteUp > 50);
    const voteStart = (totalVotes > 0);
    return {
      voteStart,
      voteValid,
      totalVotes,
      meVote,
      voteUp: { nb: voteUp.toString(), pourc: pourcVoteUp.toString(), meVoteUp },
      voteDown: { nb: voteDown.toString(), pourc: pourcVoteDown.toString(), meVoteDown },
      voteWhite: { nb: voteWhite.toString(), pourc: pourcVoteWhite.toString(), meVoteWhite },
    };
  },
  objectKeyArrayAmendements () {
    const array = [];
    if (this.amendements) {
      const amendements = this.amendements;
      const self = this;
      Object.keys(amendements).forEach(function(v) {
        amendements[v].idKey = v;
        amendements[v].votesObject = self.votesAmendements(amendements[v].votes);
        array.push(amendements[v]);
      });
    }
    return array;
  },
  listComments () {
    // console.log('listComments');
    return Comments.find({
      contextId: this._id._str,
    }, { sort: { created: -1 } });
  },
  commentsCount () {
    if (this.commentCount) {
      return this.commentCount;
    }
    return 0;
  },
});
