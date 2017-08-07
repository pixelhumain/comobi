import { Meteor } from 'meteor/meteor';

export const Cities = new Meteor.Collection('cities', { idGeneration: 'MONGO' });
