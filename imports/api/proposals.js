import { Meteor } from 'meteor/meteor';

export const Proposals = new Meteor.Collection('proposals', { idGeneration: 'MONGO' });
