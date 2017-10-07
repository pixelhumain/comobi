import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';

export const Proposals = new Mongo.Collection('proposals', { idGeneration: 'MONGO' });

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
