import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema } from './schema.js';

export const Proposals = new Mongo.Collection('proposals', { idGeneration: 'MONGO' });

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
  },
  voteActivated: {
    type: Boolean,
  },
  voteDateEnd: {
    type: Date,
  },
  majority: {
    type: String,
    defaultValue: '50',
  },
  voteAnonymous: {
    type: Boolean,
  },
  voteCanChange: {
    type: Boolean,
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
  formatAmendementDateEnd() {
    return moment(this.amendementDateEnd).format('DD/MM/YYYY HH:mm');
  },
  formatVoteDateEnd() {
    return moment(this.voteDateEnd).format('DD/MM/YYYY HH:mm');
  },
  isEndAmendement () {
    const end = moment(this.amendementDateEnd).toDate();
    const now = moment().toDate();
    return moment(end).isBefore(now); // True
  },
  isEndVote () {
    const end = moment(this.voteDateEnd).toDate();
    const now = moment().toDate();
    return moment(end).isBefore(now); // True
  },
  isNotEndAmendement () {
    const end = moment(this.amendementDateEnd).toDate();
    const now = moment().toDate();
    return moment(now).isBefore(end); // True
  },
  isNotEndVote () {
    const end = moment(this.voteDateEnd).toDate();
    const now = moment().toDate();
    return moment(now).isBefore(end); // True
  },
});
