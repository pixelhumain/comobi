import { Meteor } from 'meteor/meteor';

export const Resolutions = new Meteor.Collection('resolutions', { idGeneration: 'MONGO' });
