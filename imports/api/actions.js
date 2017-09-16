import { Meteor } from 'meteor/meteor';

export const Actions = new Meteor.Collection('actions', { idGeneration: 'MONGO' });
