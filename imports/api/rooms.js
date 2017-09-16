import { Meteor } from 'meteor/meteor';

export const Rooms = new Meteor.Collection('rooms', { idGeneration: 'MONGO' });
